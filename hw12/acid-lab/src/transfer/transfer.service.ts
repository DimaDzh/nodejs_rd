import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { Movement } from '../entities/movement.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TransferService {
  constructor(private readonly ds: DataSource) {}

  async transfer(fromId: string, toId: string, amount: number) {
    return this.ds.transaction(async (manager) => {
      const from = await manager.findOneByOrFail(Account, { id: fromId });
      const to = await manager.findOneByOrFail(Account, { id: toId });

      from.balance = Number(from.balance) - amount;
      to.balance = Number(to.balance) + amount;

      await manager.save([from, to]);

      const mv = manager.create(Movement, { from, to, amount });
      await manager.save(mv);

      // simulate crash
      if (amount === 666) {
        throw new Error('Simulated failure');
      }

      return mv;
    });
  }
}
