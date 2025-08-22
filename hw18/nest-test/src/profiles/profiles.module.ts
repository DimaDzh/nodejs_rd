import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { CustomLoggerService } from '../common/logger.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, CustomLoggerService],
})
export class ProfilesModule {}
