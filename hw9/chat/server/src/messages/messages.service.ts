import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { MessageDTO } from "../dto";
import { Store } from "../store/store";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { ChatsService } from "../chats/chats.service";

@Injectable()
export class MessagesService implements OnModuleInit {
  constructor(
    private store: Store,
    private redis: Redis,
    private chatsService: ChatsService
  ) {}

  async onModuleInit() {
    await this.loadMessagesFromFileStore();
  }

  private async loadMessagesFromFileStore() {
    try {
      const messageIds = await this.store.listData("messages");
      for (const messageId of messageIds) {
        const message = await this.store.loadData<MessageDTO>(
          "messages",
          messageId
        );
        if (message) {
          await this.redis.hset(`message:${messageId}`, {
            id: message.id,
            chatId: message.chatId,
            author: message.author,
            text: message.text,
            sentAt: message.sentAt,
          });

          // Add message to chat's sorted set (sorted by timestamp)
          const timestamp = new Date(message.sentAt).getTime();
          await this.redis.zadd(
            `chat:${message.chatId}:messages`,
            timestamp,
            messageId
          );
        }
      }
      console.log(`Loaded ${messageIds.length} messages from file store`);
    } catch (error) {
      console.error("Error loading messages from file store:", error);
    }
  }

  async getMessages(
    userId: string,
    chatId: string,
    cursor?: string,
    limit: number = 30
  ): Promise<{ items: MessageDTO[]; nextCursor?: string }> {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }

    try {
      await this.chatsService.getChatById(chatId, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException("Chat not found");
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException("You are not a member of this chat");
      }
      throw error;
    }

    // Validate limit
    if (limit <= 0 || limit > 100) {
      limit = 30;
    }

    // Get messages from Redis sorted set (sorted by timestamp)
    const messageKey = `chat:${chatId}:messages`;
    let messages: MessageDTO[] = [];
    let nextCursor: string | undefined;

    try {
      // If cursor is provided, use it as the starting point
      let maxScore = "+inf";
      if (cursor) {
        const cursorDate = new Date(cursor);
        if (isNaN(cursorDate.getTime())) {
          throw new BadRequestException(
            "Invalid cursor format. Expected ISO date string"
          );
        }
        maxScore = cursorDate.getTime().toString();
      }

      // Get messages in reverse chronological order (newest first)
      // ZREVRANGEBYSCORE returns items from high to low score
      const messageIds = await this.redis.zrevrangebyscore(
        messageKey,
        maxScore,
        "-inf",
        "LIMIT",
        cursor ? 1 : 0, // Skip the cursor message if provided
        limit + 1 // Get one extra to determine if there are more
      );

      // Fetch message details
      const pipeline = this.redis.pipeline();
      for (const messageId of messageIds) {
        pipeline.hgetall(`message:${messageId}`);
      }
      const results = await pipeline.exec();

      if (results) {
        for (let i = 0; i < Math.min(results.length, limit); i++) {
          const [err, messageData] = results[i];
          if (
            !err &&
            messageData &&
            typeof messageData === "object" &&
            "id" in messageData
          ) {
            const data = messageData as Record<string, string>;
            messages.push({
              id: data.id,
              chatId: data.chatId,
              author: data.author,
              text: data.text,
              sentAt: data.sentAt,
            });
          }
        }

        // Check if there are more messages (if we got limit + 1 results)
        if (results.length > limit && results[limit][1]) {
          const extraMessage = results[limit][1] as Record<string, string>;
          if (
            extraMessage &&
            typeof extraMessage === "object" &&
            "sentAt" in extraMessage
          ) {
            nextCursor = extraMessage.sentAt;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { items: [] };
    }

    return {
      items: messages,
      nextCursor,
    };
  }

  async createMessage(
    author: string,
    chatId: string,
    text: string
  ): Promise<MessageDTO> {
    if (!author) {
      throw new BadRequestException("Author is required");
    }

    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }

    if (!text || text.trim().length === 0) {
      throw new BadRequestException("Message text is required");
    }

    try {
      await this.chatsService.getChatById(chatId, author);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException("Chat not found");
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException("You are not a member of this chat");
      }
      throw error;
    }

    const messageId = uuidv4();
    const sentAt = new Date().toISOString();
    const timestamp = new Date(sentAt).getTime();

    const message: MessageDTO = {
      id: messageId,
      chatId,
      author,
      text: text.trim(),
      sentAt,
    };

    // Store message in Redis
    await this.redis.hset(`message:${messageId}`, {
      id: message.id,
      chatId: message.chatId,
      author: message.author,
      text: message.text,
      sentAt: message.sentAt,
    });

    // Persist to file store
    await this.store.saveData("messages", message.id, message);

    // Add message to chat's sorted set (sorted by timestamp)
    await this.redis.zadd(`chat:${chatId}:messages`, timestamp, messageId);

    // Update chat's last activity
    await this.chatsService.updateChatLastActivity(chatId);

    // Broadcast message via WebSocket
    await this.redis.publish(
      "chat-events",
      JSON.stringify({
        ev: "message",
        data: {
          id: message.id,
          author: message.author,
          text: message.text,
          sentAt: message.sentAt,
          chatId: message.chatId,
        },
        src: "service",
      })
    );

    return message;
  }
}
