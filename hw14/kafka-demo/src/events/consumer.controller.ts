import { Controller, Post, Body } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ProducerService } from "./producer.service";

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
  constructor(private readonly producerService: ProducerService) {}

  @EventPattern("events.notifications")
  handleNotification(@Payload() message: UserSignedUpEvent) {
    console.log("UserSignedUp event received and showed from Kafka:", {
      userId: message.userId,
      email: message.email,
      username: message.username,
      timestamp: message.timestamp,
      reason: message.reason,
    });
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
}
