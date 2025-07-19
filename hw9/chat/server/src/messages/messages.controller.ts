import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { MessageDTO } from "../dto";
import { MessagesService } from "./messages.service";

@Controller("/api/chats/:id/messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  async list(
    @Headers("X-User") user: string,
    @Param("id") chatId: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit = "30"
  ): Promise<{ items: MessageDTO[]; nextCursor?: string }> {
    if (!user) {
      throw new UnauthorizedException("X-User header is required");
    }
    const limitNum = parseInt(limit, 10);
    return this.messagesService.getMessages(user, chatId, cursor, limitNum);
  }

  @Post()
  async create(
    @Headers("X-User") author: string,
    @Param("id") chatId: string,
    @Body("text") text: string
  ): Promise<{ id: string; author: string; text: string; sentAt: string }> {
    if (!author) {
      throw new UnauthorizedException("X-User header is required");
    }
    const message = await this.messagesService.createMessage(
      author,
      chatId,
      text
    );
    return {
      id: message.id,
      author: message.author,
      text: message.text,
      sentAt: message.sentAt,
    };
  }
}
