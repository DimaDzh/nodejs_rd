import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import process from "process";

dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DB_PATH = path.join(__dirname, "..", "database.json");
const OFFSET = Number(
  typeof process !== "undefined" && process.env && process.env.OFFSET
    ? process.env.OFFSET
    : 0
);

export async function readDatabase() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");

    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database:", err);

    return { habits: [] };
  }
}

export async function writeDatabase(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function generateId() {
  return Date.now();
}

export function getTodayDate() {
  const today = new Date();
  today.setDate(today.getDate() + OFFSET);
  return today.toISOString().slice(0, 10);
}

export function getPastDates(date = new Date(), days = 7) {
  const result = [];
  const base = new Date(date);
  base.setDate(base.getDate() + OFFSET);

  for (let i = 0; i < days; i++) {
    const past = new Date(base);
    past.setDate(past.getDate() - i);
    result.push(past.toISOString().slice(0, 10));
  }

  return result;
}
