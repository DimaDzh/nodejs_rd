import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from './pool.provider';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import SQL from 'sql-template-strings';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly log = new Logger(MigrationService.name);
  private readonly migrationsDir: string;

  constructor(@Inject(PG_POOL) private pool: Pool) {
    // Try different possible paths for migrations
    const possiblePaths = [
      process.env.MIGRATIONS_DIR,
      join(process.cwd(), 'src', 'migrations'), // Development
      join(process.cwd(), 'dist', 'migrations'), // Production
      join(__dirname, '../migrations'), // Relative to compiled location
      join(__dirname, '../../src/migrations'), // Fallback to source
    ].filter((path): path is string => Boolean(path));

    let foundPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        foundPath = path;
        break;
      }
    }

    if (!foundPath) {
      throw new Error(
        `Migrations directory not found. Tried: ${possiblePaths.join(', ')}`,
      );
    }

    this.migrationsDir = foundPath;
    this.log.log(`Using migrations directory: ${this.migrationsDir}`);
  }

  async onModuleInit() {
    await this.ensureMigrationsTable();

    // 1 · зчитуємо список файлів
    const files = (await readdir(this.migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .toSorted(); // 001_*, 002_* …

    // 2 · які вже застосовані?
    const { rows: done } = await this.pool.query<{
      id: string;
    }>('SELECT id FROM _migrations');
    const doneIds = new Set(done.map((r) => r.id));

    // 3 · цикл по всіх файлаx
    for (const file of files) {
      const id = file.split('.', 1)[0]; // "001_init"
      if (doneIds.has(id)) continue; // пропускаємо

      this.log.log(`Applying migration ${id} …`);
      const sql = await readFile(join(this.migrationsDir, file), 'utf8');

      // запуск у транзакції — одна помилка → відкат
      await this.pool.query('BEGIN');
      try {
        await this.pool.query(sql);
        await this.pool.query(SQL`INSERT INTO _migrations(id) VALUES (${id})`);
        await this.pool.query('COMMIT');
        this.log.log(`✓ ${id} applied`);
      } catch (err) {
        await this.pool.query('ROLLBACK');
        this.log.error(`✗ ${id} failed`, err as Error);
        throw err; // зриваємо старт додатку
      }
    }

    this.log.log('Migrations up-to-date ✅');
  }

  private async ensureMigrationsTable() {
    await this.pool.query(
      SQL`
      CREATE TABLE IF NOT EXISTS _migrations(
        id text PRIMARY KEY,
        executed_at timestamptz DEFAULT now()
      )
    `,
    );
  }
}
