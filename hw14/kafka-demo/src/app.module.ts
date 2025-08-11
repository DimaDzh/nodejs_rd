import { Module } from "@nestjs/common";
import { ProducerService } from "./events/producer.service";
import { ConsumerController } from "./events/consumer.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { CronTask } from "./events/cron.task";
import { RedisService } from "./redis/redis.service";
import { RetryWorker } from "./retry/retry-worker.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ProducerService, CronTask, RedisService, RetryWorker],
  controllers: [ConsumerController],
})
export class AppModule {}
