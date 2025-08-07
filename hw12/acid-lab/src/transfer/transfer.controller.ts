import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TransferService } from './transfer.service';

interface TransferDto {
  fromId: string;
  toId: string;
  amount: number;
}
@Controller('/transfer')
export class TransferController {
  constructor(private transferService: TransferService) {}

  @Post()
  async transfer(@Body() body: TransferDto) {
    try {
      const movement = await this.transferService.transfer(
        body.fromId,
        body.toId,
        body.amount,
      );
      return movement;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Insufficient funds') {
          throw new BadRequestException('Insufficient funds');
        }

        if (
          error.constructor.name === 'EntityNotFoundError' ||
          error.message.includes('Could not find any entity')
        ) {
          throw new NotFoundException('Account not found');
        }

        if (
          error.message.includes('check constraint') ||
          error.message.includes('CHECK constraint')
        ) {
          throw new BadRequestException('Balance cannot be negative');
        }

        if (
          error.message.includes('foreign key constraint') ||
          error.message.includes('violates foreign key')
        ) {
          throw new BadRequestException('Invalid account reference');
        }
      }
      throw error;
    }
  }
}
