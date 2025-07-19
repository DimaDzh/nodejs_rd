import { Module } from "@nestjs/common";
import { Store } from "./store";
import { FileStore } from "./file-store";

@Module({
  providers: [FileStore, Store],
  exports: [Store, FileStore],
})
export class StoreModule {}
