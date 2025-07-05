import { readFileSync, writeFileSync } from "fs";

const databasePath = "./database.json";

export function readDatabase() {
  try {
    const data = readFileSync(databasePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

export function writeDatabase(data) {
  try {
    writeFileSync(databasePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
}
