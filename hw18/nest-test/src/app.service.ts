import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from './common/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: CustomLoggerService) {}

  getHello(): string {
    this.logger.log('Hello World requested!', 'AppService');
    return 'Hello World!';
  }
}
