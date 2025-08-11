import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveField1754917321670 implements MigrationInterface {
  name = 'AddIsActiveField1754917321670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
  }
}
