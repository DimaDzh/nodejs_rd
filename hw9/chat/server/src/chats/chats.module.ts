import { Module } from "@nestjs/common";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { UsersModule } from "../users/users.module";
import { RedisModule } from "../redis/redis.module";
import { StoreModule } from "../store/store.module";

@Module({
  imports: [UsersModule, RedisModule, StoreModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
