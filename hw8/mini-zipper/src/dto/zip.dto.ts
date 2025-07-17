import { IsNumber, IsPositive } from 'class-validator';

export class ProcessZipResultDto {
  @IsNumber()
  @IsPositive()
  processed: number;

  @IsNumber()
  @IsPositive()
  skipped: number;

  @IsNumber()
  @IsPositive()
  durationMs: number;
}
