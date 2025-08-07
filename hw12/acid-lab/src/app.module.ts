import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { Account } from './entities/account.entity';
import { Movement } from './entities/movement.entity';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Account, Movement],
      synchronize: true, // Only for development/testing
    }),
    DatabaseModule,
    TransferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
