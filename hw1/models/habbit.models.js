import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB = join(__dirname, "..", "database.json");

const read = async () => JSON.parse(await readFile(DB, "utf8"));
const save = async (data) => writeFile(DB, JSON.stringify(data, null, 2));

export async function getAll() {
  const list = await read();
  return list;
}

export async function create(payload) {
  const db = await read();

  const habbit = { id: Date.now().toString(), ...payload };
  await save([...db, habbit]);
  return habbit;
}

export async function updateProgressById(id, updatedProgress) {
  const db = await read();

  const idx = db.findIndex((u) => u.id == id);
  if (idx === -1) {
    console.log(`Habit with id ${id} not found.`);
    return null;
  }

  const updatedHabbit = { ...db[idx], progress: updatedProgress };
  db[idx] = updatedHabbit;
  await save(db);

  console.log(`Progress for habit with id ${id} updated successfully.`);
  return updatedHabbit;
}

export async function updateById(id, payload) {
  const db = await read();

  const idx = db.findIndex((u) => u.id == id);
  if (idx === -1) {
    console.log(`Habit with id ${id} not found.`);
    return null;
  }

  const habbit = db[idx];

  const updatedHabbit = { ...habbit, ...payload, id: habbit.id };
  db[idx] = updatedHabbit;
  await save(db);

  console.log(`Habit with id ${id} updated successfully.`);
  return updatedHabbit;
}

export async function remove(id) {
  const db = await read();
  const next = db.filter((u) => u.id !== id);
  if (next.length === db.length) return false;
  await save(next);
  return true;
}

export async function getStats() {
  const db = await read();
  return db;
}
