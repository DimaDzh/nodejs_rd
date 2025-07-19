import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ChatDTO } from "../dto";
import Redis from "ioredis";
import { Store } from "../store/store";
import { ChatsService } from "./chats.service";

@Controller("/api/chats")
export class ChatsController {
  constructor(
    private store: Store,
    private redis: Redis,
    private chatsService: ChatsService
  ) {}

  @Post()
  async create(
    @Headers("X-User") creator: string,
    @Body() body: { name?: string; members: string[] }
  ): Promise<ChatDTO> {
    if (!creator) {
      throw new UnauthorizedException("X-User header is required");
    }
    return this.chatsService.createChat(creator, body);
  }

  @Get()
  async list(@Headers("X-User") user: string): Promise<{ items: ChatDTO[] }> {
    if (!user) {
      throw new UnauthorizedException("X-User header is required");
    }
    const items = await this.chatsService.listUserChats(user);
    return { items };
  }

  @Get(":id")
  getChat(@Headers("X-User") user: string, @Param("id") id: string) {
    if (!user) {
      throw new UnauthorizedException("X-User header is required");
    }
    return this.chatsService.getChatById(id, user);
  }

  @Patch(":id/members")
  async patch(
    @Headers("X-User") admin: string,
    @Param("id") id: string,
    @Body() dto: { add?: string; remove?: string[] }
  ): Promise<{ id: string; members: string[] }> {
    if (!admin) {
      throw new UnauthorizedException("X-User header is required");
    }

    const serviceDto = {
      add: dto.add ? [dto.add] : undefined,
      remove: dto.remove,
    };

    const updatedChat = await this.chatsService.updateChatMembers(
      admin,
      id,
      serviceDto
    );

    return { id: updatedChat.id, members: updatedChat.members };
  }

  @Delete(":id")
  delete(@Headers("X-User") admin: string, @Param("id") id: string) {
    if (!admin) {
      throw new UnauthorizedException("X-User header is required");
    }
    return this.chatsService.deleteChat(admin, id);
  }
}
