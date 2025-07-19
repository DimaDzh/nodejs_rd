import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { ChatsModule } from "../chats/chats.module";
import { UsersModule } from "../users/users.module";
import { RedisModule } from "../redis/redis.module";
import { StoreModule } from "../store/store.module";

@Module({
  imports: [ChatsModule, UsersModule, RedisModule, StoreModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
