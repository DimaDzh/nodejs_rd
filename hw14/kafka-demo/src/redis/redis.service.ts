import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: 3,
    });

    console.log("✅ Redis connected");
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
  /**
   * XADD
   */
  async addToStream(streamName: string, data: any): Promise<string> {
    try {
      const messageId = await this.redis.xadd(
        streamName,
        "*", // Auto-generate ID
        "data",
        JSON.stringify(data),
        "timestamp",
        Date.now().toString()
      );

      console.log(
        `Message added to stream ${streamName} with ID: ${messageId}`
      );
      return messageId;
    } catch (error) {
      console.error(`Failed to add message to stream ${streamName}:`, error);
      throw error;
    }
  }

  /**
   * XREAD
   */
  async readFromStream(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number = 1,
    block: number = 5000
  ): Promise<any[]> {
    try {
      try {
        await this.redis.xgroup(
          "CREATE",
          streamName,
          consumerGroup,
          "0",
          "MKSTREAM"
        );
      } catch (error) {
        if (!error.message.includes("BUSYGROUP")) {
          console.error("Error creating consumer group:", error);
        }
      }

      const result = await this.redis.xreadgroup(
        "GROUP",
        consumerGroup,
        consumerName,
        "COUNT",
        count,
        "BLOCK",
        block,
        "STREAMS",
        streamName,
        ">"
      );

      if (!result || result.length === 0) {
        return [];
      }

      const messages = [];
      for (const streamData of result as any[]) {
        const [stream, streamMessages] = streamData;
        for (const messageData of streamMessages) {
          const [messageId, fields] = messageData;
          const message = {
            id: messageId,
            stream,
            data: {},
          };

          for (let i = 0; i < fields.length; i += 2) {
            const key = fields[i];
            const value = fields[i + 1];

            if (key === "data") {
              try {
                message.data = JSON.parse(value);
              } catch {
                message.data = value;
              }
            } else {
              message.data[key] = value;
            }
          }

          messages.push(message);
        }
      }

      return messages;
    } catch (error) {
      console.error(`❌ Failed to read from stream ${streamName}:`, error);
      throw error;
    }
  }

  /**
   *  XACK
   */
  async ackMessage(
    streamName: string,
    consumerGroup: string,
    messageId: string
  ): Promise<void> {
    try {
      await this.redis.xack(streamName, consumerGroup, messageId);
      console.log(
        `✅ Message ${messageId} acknowledged in stream ${streamName}`
      );
    } catch (error) {
      console.error(`❌ Failed to acknowledge message ${messageId}:`, error);
      throw error;
    }
  }

  getClient(): Redis {
    return this.redis;
  }
}
