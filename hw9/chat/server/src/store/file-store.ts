import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from "@nestjs/common";
import { promises as fs } from "fs";
import * as path from "path";

@Injectable()
export class FileStore implements OnModuleInit {
  private readonly baseDir = path.resolve(__dirname, "../../../tmp/files");

  async onModuleInit() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      throw new InternalServerErrorException(
        "Cannot initialize file store directory"
      );
    }
  }

  async saveFile(filename: string, content: Buffer): Promise<string> {
    const fullPath = path.join(this.baseDir, filename);
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  async readFile(filename: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filename);
    return fs.readFile(fullPath);
  }

  async deleteFile(filename: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filename);
    await fs.unlink(fullPath);
  }

  getFullPath(filename: string): string {
    return path.join(this.baseDir, filename);
  }

  async listFiles(): Promise<string[]> {
    return fs.readdir(this.baseDir);
  }
}
