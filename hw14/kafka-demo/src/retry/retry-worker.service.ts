import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { ProducerService } from "../events/producer.service";

interface RetryMessage {
  id: string;
  stream: string;
  data: {
    originalMessage: any;
    attemptCount: number;
    lastAttempt: string;
    error: string;
  };
}

@Injectable()
export class RetryWorker implements OnModuleInit {
  private readonly STREAM_NAME = "retries.notifications";
  private readonly CONSUMER_GROUP = "retry-workers";
  private readonly CONSUMER_NAME = "retry-worker-1";
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_INTERVAL = 5000; // 5 seconds

  private isProcessing = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly producerService: ProducerService
  ) {}

  async onModuleInit() {
    console.log("🔄 RetryWorker starting...");
    this.startProcessing();
  }

  private async startProcessing() {
    while (true) {
      if (this.isProcessing) {
        await this.sleep(1000);
        continue;
      }

      try {
        this.isProcessing = true;
        await this.processRetryMessages();
      } catch (error) {
        console.error("Error in RetryWorker:", error);
      } finally {
        this.isProcessing = false;
      }

      await this.sleep(this.RETRY_INTERVAL);
    }
  }

  private async processRetryMessages(): Promise<void> {
    try {
      const messages = await this.redisService.readFromStream(
        this.STREAM_NAME,
        this.CONSUMER_GROUP,
        this.CONSUMER_NAME,
        10,
        5000
      );

      if (messages.length === 0) {
        return;
      }

      console.log(`Processing ${messages.length} retry messages`);

      for (const message of messages as RetryMessage[]) {
        await this.processRetryMessage(message);
      }
    } catch (error) {
      console.error("Failed to process retry messages:", error);
    }
  }

  private async processRetryMessage(message: RetryMessage): Promise<void> {
    try {
      const { originalMessage, attemptCount, error } = message.data;

      console.log(
        `Retrying message (attempt ${attemptCount + 1}/${this.MAX_RETRIES}):`,
        {
          messageId: message.id,
          originalMessage,
          lastError: error,
        }
      );

      if (attemptCount >= this.MAX_RETRIES) {
        console.log(
          ` Max retries reached for message ${message.id}, moving to dead letter queue`
        );
        await this.moveToDeadLetterQueue(message);
        await this.redisService.ackMessage(
          this.STREAM_NAME,
          this.CONSUMER_GROUP,
          message.id
        );
        return;
      }

      // Try to process the original message again by sending it back to Kafka
      await this.producerService.sendEvent(originalMessage);

      console.log(`Message ${message.id} successfully retried`);

      // Acknowledge successful processing
      await this.redisService.ackMessage(
        this.STREAM_NAME,
        this.CONSUMER_GROUP,
        message.id
      );
    } catch (error) {
      console.error(`Failed to retry message ${message.id}:`, error);

      // Increment attempt count and add back to retry queue
      await this.requeueForRetry(message, error.message);
      await this.redisService.ackMessage(
        this.STREAM_NAME,
        this.CONSUMER_GROUP,
        message.id
      );
    }
  }

  private async requeueForRetry(
    message: RetryMessage,
    errorMessage: string
  ): Promise<void> {
    try {
      const newRetryMessage = {
        originalMessage: message.data.originalMessage,
        attemptCount: (message.data.attemptCount || 0) + 1,
        lastAttempt: new Date().toISOString(),
        error: errorMessage,
        previousMessageId: message.id,
      };

      // Add back to retry queue with increased attempt count
      await this.redisService.addToStream(this.STREAM_NAME, newRetryMessage);
      console.log(
        `Message requeued for retry with attempt count: ${newRetryMessage.attemptCount}`
      );
    } catch (error) {
      console.error(`Failed to requeue message for retry:`, error);
    }
  }

  private async moveToDeadLetterQueue(message: RetryMessage): Promise<void> {
    try {
      const deadLetterMessage = {
        ...message.data,
        finalFailureTime: new Date().toISOString(),
        originalMessageId: message.id,
      };

      await this.redisService.addToStream(
        "dead-letter.notifications",
        deadLetterMessage
      );
      console.log(`Message moved to dead letter queue: ${message.id}`);
    } catch (error) {
      console.error(`Failed to move message to dead letter queue:`, error);
    }
  }

  /**
   * Add a failed message to the retry queue
   */
  async addToRetryQueue(originalMessage: any, error: string): Promise<void> {
    try {
      const retryMessage = {
        originalMessage,
        attemptCount: 0,
        lastAttempt: new Date().toISOString(),
        error,
      };

      await this.redisService.addToStream(this.STREAM_NAME, retryMessage);
      console.log(`Message added to retry queue:`, originalMessage);
    } catch (err) {
      console.error(`Failed to add message to retry queue:`, err);
      throw err;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
