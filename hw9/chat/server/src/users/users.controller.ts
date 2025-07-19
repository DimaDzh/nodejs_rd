import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { UserDTO } from "../dto";
import { UsersService } from "./user.service";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor("icon"))
  async createUser(
    @Headers("X-User") adminName: string,
    @Body("name") name: string,
    @UploadedFile() icon?: Express.Multer.File
  ): Promise<{ id: string; name: string; iconUrl: string }> {
    if (!adminName) {
      throw new UnauthorizedException("X-User header is required");
    }
    return this.usersService.createUser(adminName, name, icon);
  }

  @Get()
  async list(): Promise<{ items: UserDTO[]; total: number }> {
    return this.usersService.getAllUsers();
  }

  @Get(":id/icon")
  async getUserIcon(@Param("id") userId: string, @Res() res: Response) {
    try {
      const { buffer, contentType } = await this.usersService.getUserIconById(
        userId
      );
      res.set({
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
      });
      res.send(buffer);
    } catch (error) {
      res.status(404).json({ message: "Icon not found" });
    }
  }
}
