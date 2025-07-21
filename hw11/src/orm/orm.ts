import { Pool } from "pg";
import SQL from "sql-template-strings";

export class Orm<T extends object & { id: any }> {
  constructor(private table: string, private pool: Pool) {}

  async find(filters?: Partial<T>): Promise<T[]> {
    let query = SQL`SELECT * FROM `.append(this.table);

    if (filters && Object.keys(filters).length > 0) {
      const entries = Object.entries(filters);
      query = query.append(" WHERE ");

      entries.forEach(([key, value], index) => {
        if (index > 0) {
          query = query.append(" AND ");
        }
        query = query
          .append(key)
          .append(" = ")
          .append(SQL`${value}`);
      });
    }

    const result = await this.pool.query(query);

    return result.rows as T[];
  }

  async findOne(id: T["id"]): Promise<T | null> {
    const query = SQL`SELECT * FROM `
      .append(this.table)
      .append(SQL` WHERE id = ${id}`);
    const result = await this.pool.query(query);
    return (result.rows[0] as T) || null;
  }

  async save(entity: Omit<T, "id">): Promise<T> {
    const keys = Object.keys(entity);
    const values = Object.values(entity);

    let query = SQL`INSERT INTO `.append(this.table).append(` (`);

    keys.forEach((key, index) => {
      if (index > 0) query = query.append(", ");
      query = query.append(key);
    });

    query = query.append(`) VALUES (`);

    values.forEach((value, index) => {
      if (index > 0) query = query.append(", ");
      query = query.append(SQL`${value}`);
    });

    query = query.append(`) RETURNING *`);

    const result = await this.pool.query(query);
    return result.rows[0] as T;
  }

  async update(id: T["id"], patch: Partial<T>): Promise<T> {
    const keys = Object.keys(patch);
    const values = Object.values(patch);

    if (keys.length === 0) {
      throw new Error("No fields to update");
    }

    let query = SQL`UPDATE `.append(this.table).append(` SET `);

    keys.forEach((key, index) => {
      if (index > 0) query = query.append(", ");
      query = query
        .append(key)
        .append(" = ")
        .append(SQL`${values[index]}`);
    });

    query = query.append(SQL` WHERE id = ${id} RETURNING *`);

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      throw new Error(`Record with id ${id} not found`);
    }

    return result.rows[0] as T;
  }

  async delete(id: T["id"]): Promise<void> {
    const query = SQL`DELETE FROM `
      .append(this.table)
      .append(SQL` WHERE id = ${id}`);
    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new Error(`Record with id ${id} not found`);
    }
  }
}
