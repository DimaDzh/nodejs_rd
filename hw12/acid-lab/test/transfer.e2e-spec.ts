import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Account } from '../src/entities/account.entity';
import { Movement } from '../src/entities/movement.entity';

describe('Transfer e2e (rollback test)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM movement');
  });

  it('should rollback transaction when trying to transfer more than balance', async () => {
    const accountRepo = dataSource.getRepository(Account);
    const movementRepo = dataSource.getRepository(Movement);

    const fromAccount = await accountRepo.save({ balance: 10 });
    const toAccount = await accountRepo.save({ balance: 2 });

    const res = await request(app.getHttpServer()).post('/transfer').send({
      fromId: fromAccount.id,
      toId: toAccount.id,
      amount: 200,
    });

    expect(res.status).toBe(400);

    const fromAfter = await accountRepo.findOneBy({ id: fromAccount.id });
    const toAfter = await accountRepo.findOneBy({ id: toAccount.id });

    expect(Number(fromAfter?.balance)).toBe(10);
    expect(Number(toAfter?.balance)).toBe(2);

    const movementCount = await movementRepo.count();
    expect(movementCount).toBe(0);
  });
});
