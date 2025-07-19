import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from "@nestjs/common";
import { ChatDTO } from "../dto";
import { Store } from "../store/store";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ChatsService implements OnModuleInit {
  private chats: Map<string, ChatDTO> = new Map();

  constructor(private store: Store, private redis: Redis) {}

  async onModuleInit() {
    await this.loadChatsFromFileStore();
  }

  private async loadChatsFromFileStore() {
    try {
      const chatIds = await this.store.listData("chats");
      for (const chatId of chatIds) {
        const chat = await this.store.loadData<ChatDTO>("chats", chatId);
        if (chat) {
          this.chats.set(chatId, chat);
          await this.redis.hset(`chat:${chatId}`, {
            id: chat.id,
            name: chat.name,
            members: JSON.stringify(chat.members),
            creator: chat.creator,
            updatedAt: chat.updatedAt,
          });

          // Add chat to each member's chat list in Redis
          for (const member of chat.members) {
            await this.redis.sadd(`user:${member}:chats`, chatId);
          }
        }
      }
      console.log(`Loaded ${chatIds.length} chats from file store`);
    } catch (error) {
      console.error("Error loading chats from file store:", error);
    }
  }

  async createChat(
    creator: string,
    body: { name?: string; members: string[] }
  ): Promise<ChatDTO> {
    if (!body.members || !Array.isArray(body.members)) {
      throw new BadRequestException("Members array is required");
    }

    if (body.members.length === 0) {
      throw new BadRequestException("At least one member is required");
    }

    if (!body.members.includes(creator)) {
      body.members.push(creator);
    }

    const uniqueMembers = [...new Set(body.members)];

    const chatId = uuidv4();
    const chat: ChatDTO = {
      id: chatId,
      name: body.name || `Chat ${chatId.substring(0, 8)}`,
      members: uniqueMembers,
      creator: creator,
      updatedAt: new Date().toISOString(),
    };

    this.chats.set(chatId, chat);

    await this.redis.hset(`chat:${chatId}`, {
      id: chat.id,
      name: chat.name,
      members: JSON.stringify(chat.members),
      creator: chat.creator,
      updatedAt: chat.updatedAt,
    });

    await this.store.saveData("chats", chat.id, chat);

    for (const member of chat.members) {
      await this.redis.sadd(`user:${member}:chats`, chatId);
    }

    return chat;
  }

  async listUserChats(userId: string): Promise<ChatDTO[]> {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }
    const chatIds = await this.redis.smembers(`user:${userId}:chats`);

    if (chatIds.length === 0) {
      return [];
    }

    const chats: ChatDTO[] = [];

    for (const chatId of chatIds) {
      const chatData = await this.redis.hgetall(`chat:${chatId}`);

      if (chatData.id) {
        const chat: ChatDTO = {
          id: chatData.id,
          name: chatData.name,
          members: JSON.parse(chatData.members || "[]"),
          creator: chatData.creator,
          updatedAt: chatData.updatedAt,
        };

        if (chat.members.includes(userId)) {
          chats.push(chat);
        } else {
          await this.redis.srem(`user:${userId}:chats`, chatId);
        }
      }
    }
    return chats.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async updateChatMembers(
    actorId: string,
    chatId: string,
    dto: { add?: string[]; remove?: string[] }
  ): Promise<ChatDTO> {
    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }
    const chatData = await this.redis.hgetall(`chat:${chatId}`);

    if (!chatData.id) {
      throw new NotFoundException("Chat not found");
    }

    const chat: ChatDTO = {
      id: chatData.id,
      name: chatData.name,
      members: JSON.parse(chatData.members || "[]"),
      creator: chatData.creator,
      updatedAt: chatData.updatedAt,
    };

    if (chat.creator !== actorId) {
      throw new ForbiddenException("Only the chat creator can modify members");
    }

    let members = [...chat.members];

    if (dto.add && Array.isArray(dto.add)) {
      for (const newMember of dto.add) {
        if (!members.includes(newMember)) {
          members.push(newMember);
          await this.redis.sadd(`user:${newMember}:chats`, chatId);
        }
      }
    }

    if (dto.remove && Array.isArray(dto.remove)) {
      for (const memberToRemove of dto.remove) {
        if (memberToRemove === actorId) {
          throw new BadRequestException(
            "You cannot remove yourself from the chat"
          );
        }

        members = members.filter((m) => m !== memberToRemove);
        await this.redis.srem(`user:${memberToRemove}:chats`, chatId);
      }
    }

    if (members.length === 0) {
      throw new BadRequestException("Cannot remove all members from chat");
    }

    const updatedChat: ChatDTO = {
      ...chat,
      members,
      updatedAt: new Date().toISOString(),
    };

    // Update in memory and Redis
    this.chats.set(chatId, updatedChat);
    await this.redis.hset(`chat:${chatId}`, {
      members: JSON.stringify(updatedChat.members),
      updatedAt: updatedChat.updatedAt,
    });

    // Persist updated chat to file store
    await this.store.saveData("chats", chatId, updatedChat);

    // Broadcast members update event
    await this.redis.publish(
      "chat-events",
      JSON.stringify({
        ev: "membersUpdated",
        data: { chatId, members: updatedChat.members },
        src: "service",
      })
    );

    return updatedChat;
  }

  async deleteChat(adminId: string, chatId: string): Promise<void> {
    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }
    const chatData = await this.redis.hgetall(`chat:${chatId}`);

    if (!chatData.id) {
      throw new NotFoundException("Chat not found");
    }
    const chat: ChatDTO = {
      id: chatData.id,
      name: chatData.name,
      members: JSON.parse(chatData.members || "[]"),
      creator: chatData.creator,
      updatedAt: chatData.updatedAt,
    };

    if (chat.creator !== adminId) {
      throw new ForbiddenException(
        "Only the chat creator can delete this chat"
      );
    }

    for (const member of chat.members) {
      await this.redis.srem(`user:${member}:chats`, chatId);
    }

    await this.redis.del(`chat:${chatId}`);

    this.chats.delete(chatId);

    const messageKeys = await this.redis.keys(`message:${chatId}:*`);
    if (messageKeys.length > 0) {
      await this.redis.del(...messageKeys);
    }

    await this.store.deleteData("chats", chatId);
  }

  async getChatById(chatId: string, userId: string): Promise<ChatDTO> {
    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }

    const chatData = await this.redis.hgetall(`chat:${chatId}`);

    if (!chatData.id) {
      throw new NotFoundException("Chat not found");
    }

    const chat: ChatDTO = {
      id: chatData.id,
      name: chatData.name,
      members: JSON.parse(chatData.members || "[]"),
      creator: chatData.creator,
      updatedAt: chatData.updatedAt,
    };

    if (!chat.members.includes(userId)) {
      throw new ForbiddenException("You are not a member of this chat");
    }

    return chat;
  }

  async updateChatLastActivity(chatId: string): Promise<void> {
    const chatData = await this.redis.hgetall(`chat:${chatId}`);

    if (chatData.id) {
      await this.redis.hset(`chat:${chatId}`, {
        updatedAt: new Date().toISOString(),
      });
    }
  }
}
