import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const createPool = (): Pool => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
};

export const pool = createPool();
