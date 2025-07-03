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

export async function updateProgressById(id, payload) {
  const db = await read();

  const idx = db.findIndex((u) => u.id == id);
  if (idx === -1) {
    console.log(`Habit with id ${id} not found.`);
    return null;
  }

  const habbit = db[idx];
  const updatedProgress = habbit.progress.map((p) =>
    p.item === parseInt(payload.item, 10) ? { ...p, done: payload.done } : p
  );

  const updatedHabbit = { ...habbit, progress: updatedProgress };
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

  db[idx] = payload;
  await save(db);

  console.log(`Habit with id ${id} updated successfully.`);
  return habbit;
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

  const stats = db.map((habbit) => {
    let completed = 0;
    let total = 0;

    if (habbit.freq === "daily") {
      total = Math.min(30, habbit.progress.length);
      completed = habbit.progress.slice(0, total).filter((p) => p.done).length;
    } else if (habbit.freq === "weekly") {
      total = Math.min(4, habbit.progress.length);
      completed = habbit.progress.slice(0, total).filter((p) => p.done).length;
    } else if (habbit.freq === "monthly") {
      total = 1;
      completed = habbit.done ? 1 : 0;
    }

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      id: habbit.id,
      name: habbit.name,
      freq: habbit.freq,
      percentage: percentage.toFixed(2) + "%",
    };
  });

  stats.forEach((stat) => {
    console.table(
      `Habit ID: ${stat.id}, Name: ${stat.name}, Frequency: ${stat.freq}, Completion: ${stat.percentage}`
    );
  });

  return stats;
}
