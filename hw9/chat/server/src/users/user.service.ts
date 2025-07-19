import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserDTO } from "../dto";
import { Store } from "../store/store";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import * as path from "path";
import * as sharp from "sharp";

@Injectable()
export class UsersService {
  private readonly iconsDir = path.resolve(__dirname, "../../public/icons");
  private readonly defaultIconPath = path.join(this.iconsDir, "default.png");

  constructor(private store: Store, private redis: Redis) {
    this.initializeIconsDirectory();
  }

  private async initializeIconsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.iconsDir, { recursive: true });

      // Verify default icon exists
      try {
        await fs.access(this.defaultIconPath);
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("Failed to initialize icons directory:", error);
    }
  }

  async createUser(
    adminName: string,
    name: string,
    iconFile?: Express.Multer.File
  ): Promise<{ id: string; name: string; iconUrl: string }> {
    if (!adminName) {
      throw new BadRequestException("Admin name is required in X-User header");
    }

    if (!name || name.trim().length === 0) {
      throw new BadRequestException("User name is required");
    }

    const trimmedName = name.trim();

    // Check if user already exists
    const existingUserId = await this.redis.get(`username:${trimmedName}`);
    if (existingUserId) {
      throw new ConflictException("User with this name already exists");
    }

    // Validate icon file if provided
    if (iconFile) {
      if (
        !["image/png", "image/jpeg", "image/jpg"].includes(iconFile.mimetype)
      ) {
        throw new BadRequestException("Icon must be PNG or JPEG format");
      }

      if (iconFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new BadRequestException("Icon file size must be less than 5MB");
      }
    }

    const userId = uuidv4();
    const iconFileName = `${userId}.png`;
    const iconPath = path.join(this.iconsDir, iconFileName);
    const iconUrl = `/api/users/${userId}/icon`;

    try {
      if (iconFile) {
        await this.processAndSaveIcon(iconFile.buffer, iconPath);
      }

      const user: UserDTO = {
        id: userId,
        name: trimmedName,
        iconUrl: iconUrl,
      };

      // Store user in Redis
      await this.redis.hset(`user:${userId}`, {
        id: user.id,
        name: user.name,
        iconUrl: user.iconUrl,
      });

      // Create username -> userId mapping for quick lookups
      await this.redis.set(`username:${trimmedName}`, userId);

      // Add to users list
      await this.redis.sadd("users:all", userId);

      return {
        id: user.id,
        name: user.name,
        iconUrl: user.iconUrl,
      };
    } catch (error) {
      // Cleanup on failure
      try {
        await fs.unlink(iconPath).catch(() => {});
        await this.redis.del(`user:${userId}`);
        await this.redis.del(`username:${trimmedName}`);
        await this.redis.srem("users:all", userId);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup after user creation error:",
          cleanupError
        );
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to create user");
    }
  }

  private async processAndSaveIcon(
    buffer: Buffer,
    outputPath: string
  ): Promise<void> {
    try {
      await sharp(buffer)
        .resize(128, 128, {
          fit: "cover",
          position: "center",
        })
        .png({ quality: 90 })
        .toFile(outputPath);
    } catch (error) {
      throw new BadRequestException("Invalid image file or processing failed");
    }
  }

  async getAllUsers(): Promise<{ items: UserDTO[]; total: number }> {
    try {
      const userIds = await this.redis.smembers("users:all");

      if (userIds.length === 0) {
        return { items: [], total: 0 };
      }

      const pipeline = this.redis.pipeline();
      for (const userId of userIds) {
        pipeline.hgetall(`user:${userId}`);
      }

      const results = await pipeline.exec();
      const users: UserDTO[] = [];

      if (results) {
        for (const [err, userData] of results) {
          if (
            !err &&
            userData &&
            typeof userData === "object" &&
            "id" in userData
          ) {
            const data = userData as Record<string, string>;
            users.push({
              id: data.id,
              name: data.name,
              iconUrl: data.iconUrl,
            });
          }
        }
      }

      // Sort users by name
      users.sort((a, b) => a.name.localeCompare(b.name));

      return {
        items: users,
        total: users.length,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { items: [], total: 0 };
    }
  }

  async getUserIcon(
    iconPath: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    if (!iconPath) {
      throw new BadRequestException("Icon path is required");
    }

    // Sanitize the path to prevent directory traversal
    const sanitizedPath = path.basename(iconPath);
    const fullPath = path.join(this.iconsDir, sanitizedPath);

    try {
      // Check if file exists
      await fs.access(fullPath);
      const buffer = await fs.readFile(fullPath);

      return {
        buffer,
        contentType: "image/png",
      };
    } catch (error) {
      console.log(`User icon not found: ${fullPath}, using default icon`);

      // Return default icon if requested icon doesn't exist
      try {
        const buffer = await fs.readFile(this.defaultIconPath);
        return {
          buffer,
          contentType: "image/png",
        };
      } catch (defaultError) {
        console.error(
          "Default icon also not found:",
          this.defaultIconPath,
          defaultError
        );
        throw new NotFoundException(
          "Icon not found and default icon unavailable"
        );
      }
    }
  }

  async getUserIconById(
    userId: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    try {
      // Get user data from Redis
      const userData = await this.redis.hgetall(`user:${userId}`);

      if (!userData || !userData.id) {
        throw new NotFoundException("User not found");
      }

      // Use userId for filename since we save icons as {userId}.png
      const iconFileName = `${userId}.png`;

      return this.getUserIcon(iconFileName);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Return default icon for any other error
      try {
        const buffer = await fs.readFile(this.defaultIconPath);
        return {
          buffer,
          contentType: "image/png",
        };
      } catch (defaultError) {
        throw new InternalServerErrorException("Failed to load user icon");
      }
    }
  }
}
