import { pool } from "../database/pool.provider";
import { Orm } from "../orm/orm";

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class UserRepository {
  private orm: Orm<User>;

  constructor() {
    this.orm = new Orm<User>("users", pool);
  }

  async findUsers(filters: Partial<User>): Promise<User[]> {
    return this.orm.find(filters);
  }

  async findOneUser(id: number): Promise<User | null> {
    return this.orm.findOne(id);
  }

  async createUser(
    userData: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User> {
    return this.orm.save(userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.orm.update(id, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.orm.delete(id);
  }
}

export const userRepository = new UserRepository();
