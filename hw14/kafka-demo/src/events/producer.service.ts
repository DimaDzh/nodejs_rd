import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit {
  private kafka = new Kafka({ brokers: ['localhost:9092'] });
  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async sendEvent(data: any) {
    await this.producer.send({
      topic: 'events.notifications',
      messages: [{
        value: JSON.stringify(data)
      }],
    });
  }
}
