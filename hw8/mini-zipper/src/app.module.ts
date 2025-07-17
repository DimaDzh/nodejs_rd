import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './tmp',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
