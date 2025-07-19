import { Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { ChatGateway } from "./chat.gateway";
import { ChatsModule } from "../chats/chats.module";
import { MessagesModule } from "../messages/messages.module";
import { UsersModule } from "../users/users.module";
import { StoreModule } from "../store/store.module";

@Module({
  imports: [RedisModule, ChatsModule, MessagesModule, UsersModule, StoreModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WsModule {}
