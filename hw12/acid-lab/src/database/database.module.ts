import { Module } from '@nestjs/common';
import { poolProvider } from './pool.provider';
import { MigrationService } from './migration.service';

@Module({
  providers: [poolProvider, MigrationService],
  exports: [poolProvider],
})
export class DatabaseModule {}
