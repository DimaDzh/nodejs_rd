import {Module} from '@nestjs/common';
import {ProducerService} from './events/producer.service';
import {ConsumerController} from './events/consumer.controller';
import {ScheduleModule} from "@nestjs/schedule";
import {CronTask} from "./events/cron.task";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ProducerService, CronTask],
  controllers: [ConsumerController],
})
export class AppModule {
}
