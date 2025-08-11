import { Controller, Post, Body } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ProducerService } from "./producer.service";
import { RetryWorker } from "../retry/retry-worker.service";

interface SignupDto {
  email?: string;
  username?: string;
}

interface UserSignedUpEvent {
  userId: string;
  email?: string;
  username?: string;
  timestamp: Date;
  reason?: "singup" | "cron"; // "singup" for user signup, "cron" for cron task
}

@Controller()
export class ConsumerController {
  constructor(
    private readonly producerService: ProducerService,
    private readonly retryWorker: RetryWorker
  ) {}

  @EventPattern("events.notifications")
  async handleNotification(@Payload() message: UserSignedUpEvent) {
    try {
      console.log("UserSignedUp event received and showed from Kafka:", {
        userId: message.userId,
        email: message.email,
        username: message.username,
        timestamp: message.timestamp,
        reason: message.reason,
      });

      if (Math.random() < 0.3) {
        throw new Error("Simulated consumer processing failure");
      }

      // Simulate processing time
      await this.sleep(100);

      console.log(`Message processed successfully for user: ${message.userId}`);
    } catch (error) {
      console.error(
        `Failed to process message for user ${message.userId}:`,
        error.message
      );

      await this.retryWorker.addToRetryQueue(message, error.message);
    }
  }
  @Post("signup")
  async signup(@Body() signupData: SignupDto) {
    const userId = Math.random().toString(36).slice(2);

    const userSignedUpEvent: UserSignedUpEvent = {
      userId,
      email: signupData.email,
      username: signupData.username,
      timestamp: new Date(),
      reason: "singup",
    };

    await this.producerService.sendEvent(userSignedUpEvent);

    return {
      status: "User signed up successfully",
      userId,
      message: "UserSignedUp event published to Kafka",
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
