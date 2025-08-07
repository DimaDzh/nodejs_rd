import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ProducerService } from "./producer.service";

@Injectable()
export class CronTask {
  constructor(private readonly producerService: ProducerService) {}

  @Cron("*/10 * * * * *") // кожні 10 секунд
  async handleCron() {
    const userId = Math.random().toString(36).slice(2);
    console.log("[CRON] Dispatching event for userId:", userId);

    await this.producerService.sendEvent({
      userId,
      timestamp: new Date(),
      email: "new@example.com",
      username: "newUser",
      reason: "cron",
    });
  }
}
