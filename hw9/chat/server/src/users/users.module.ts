import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./user.service";
import { RedisModule } from "../redis/redis.module";
import { StoreModule } from "../store/store.module";

@Module({
  imports: [RedisModule, StoreModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
