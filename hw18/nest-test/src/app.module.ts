import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProfilesModule } from './profiles/profiles.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomLoggerService } from './common/logger.service';

@Module({
  imports: [PrismaModule, ProfilesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppModule {}
