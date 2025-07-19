import { Injectable, OnModuleInit } from "@nestjs/common";
import { FileStore } from "./file-store";
import { promises as fs } from "fs";
import * as path from "path";

@Injectable()
export class Store implements OnModuleInit {
  private readonly dataDir: string;

  constructor(private fileStore: FileStore) {
    this.dataDir = path.resolve(__dirname, "../../../tmp/data");
  }

  async onModuleInit() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async saveData(collection: string, id: string, data: any): Promise<void> {
    const collectionDir = path.join(this.dataDir, collection);
    await fs.mkdir(collectionDir, { recursive: true });

    const filePath = path.join(collectionDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async loadData<T>(collection: string, id: string): Promise<T | null> {
    try {
      const filePath = path.join(this.dataDir, collection, `${id}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch (error) {
      return null;
    }
  }

  async deleteData(collection: string, id: string): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, collection, `${id}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  async listData(collection: string): Promise<string[]> {
    try {
      const collectionDir = path.join(this.dataDir, collection);
      const files = await fs.readdir(collectionDir);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(".json", ""));
    } catch (error) {
      return [];
    }
  }
}
