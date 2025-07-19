import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import {
  ForbiddenException,
  OnModuleDestroy,
  Injectable,
} from "@nestjs/common";
import { Store } from "../store/store";
import { ChatsService } from "../chats/chats.service";
import { MessagesService } from "../messages/messages.service";

@WebSocketGateway({ path: "/ws", cors: true })
@Injectable()
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;
  private readonly sub: Redis;

  private connectedUsers: Map<string, Set<Socket>> = new Map();
  private event$ = new Subject<any>();

  constructor(
    private store: Store,
    private readonly redis: Redis,
    private chatsService: ChatsService,
    private messagesService: MessagesService
  ) {
    this.sub = this.redis.duplicate();

    this.event$
      .pipe(filter((event) => event.ev === "message"))
      .subscribe((event) => {
        this.server.to(`chat:${event.data.chatId}`).emit("message", event.data);
      });

    this.event$
      .pipe(filter((event) => event.ev === "typing"))
      .subscribe((event) => {
        this.server.to(`chat:${event.data.chatId}`).emit("typing", event.data);
      });
  }

  onModuleDestroy() {
    this.sub.disconnect();
    this.redis.disconnect();
  }

  handleConnection(client: Socket) {
    const user = client.handshake.auth?.user as string;

    if (!user) return client.disconnect(true);
    client.data.user = user;

    // Track connected users
    if (!this.connectedUsers.has(user)) {
      this.connectedUsers.set(user, new Set());
    }
    this.connectedUsers.get(user)!.add(client);

    console.log(`User ${user} connected`);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as string;
    if (user && this.connectedUsers.has(user)) {
      this.connectedUsers.get(user)!.delete(client);
      if (this.connectedUsers.get(user)!.size === 0) {
        this.connectedUsers.delete(user);
      }
    }
  }

  @SubscribeMessage("join")
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string }
  ) {
    const user = client.data.user as string;

    try {
      await this.chatsService.getChatById(body.chatId, user);

      client.join(`chat:${body.chatId}`);

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join chat";

      throw new ForbiddenException(message);
    }
  }

  @SubscribeMessage("leave")
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string }
  ) {
    const user = client.data.user as string;

    client.leave(`chat:${body.chatId}`);

    return { success: true };
  }

  @SubscribeMessage("send")
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; text: string }
  ) {
    const user = client.data.user as string;

    try {
      const message = await this.messagesService.createMessage(
        user,
        body.chatId,
        body.text
      );

      const messageEvent = {
        ev: "message",
        data: {
          id: message.id,
          author: message.author,
          text: message.text,
          sentAt: message.sentAt,
          chatId: body.chatId,
        },
        meta: { local: true },
      };

      this.event$.next(messageEvent);

      console.log(`Message sent by ${user} to chat ${body.chatId}`);
      return { success: true, messageId: message.id };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      console.error(
        `User ${user} failed to send message to chat ${body.chatId}:`,
        message
      );
      throw new ForbiddenException(message);
    }
  }

  @SubscribeMessage("typing")
  async onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; isTyping: boolean }
  ) {
    const user = client.data.user as string;

    try {
      await this.chatsService.getChatById(body.chatId, user);

      const typingEvent = {
        ev: "typing",
        data: {
          user,
          chatId: body.chatId,
          isTyping: body.isTyping,
        },
        meta: { local: true },
      };

      client.to(`chat:${body.chatId}`).emit("typing", typingEvent.data);

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send typing status";

      throw new ForbiddenException(message);
    }
  }

  async broadcastChatCreated(chatData: any) {
    chatData.members.forEach((member: string) => {
      const userSockets = this.connectedUsers.get(member);
      if (userSockets) {
        userSockets.forEach((socket) => {
          socket.emit("chatCreated", {
            id: chatData.id,
            name: chatData.name,
            members: chatData.members,
            creator: chatData.creator,
            updatedAt: chatData.updatedAt,
          });
        });
      } else {
        console.warn(
          `⚠️ User ${member} not connected, cannot notify about new chat ${chatData.id}`
        );
      }
    });
  }

  async broadcastMembersUpdated(chatId: string, members: string[]) {
    console.log(
      `Broadcasting member update for chat ${chatId} to members:`,
      members
    );

    // Notify all current chat participants
    this.server
      .to(`chat:${chatId}`)
      .emit("membersUpdated", { chatId, members });

    // Also notify newly added members who might not be in the room yet
    members.forEach((member: string) => {
      const userSockets = this.connectedUsers.get(member);
      if (userSockets) {
        userSockets.forEach((socket) => {
          socket.emit("chatUpdated", {
            chatId,
            members,
            type: "membersChanged",
          });
        });
      }
    });
  }
}
