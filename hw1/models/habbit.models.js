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

  if (habbit.freq === "daily") {
    const today = new Date().getDate();
    const progressIdx = habbit.progress.findIndex((p) => p.day === today);
    if (progressIdx !== -1) {
      habbit.progress[progressIdx].done = true;
    }
  } else if (habbit.freq === "weekly") {
    const currentWeek = Math.ceil(new Date().getDate() / 7);
    const progressIdx = habbit.progress.findIndex(
      (p) => p.week === currentWeek
    );
    if (progressIdx !== -1) {
      habbit.progress[progressIdx].done = true;
    }
  } else if (habbit.freq === "monthly") {
    if (habbit.progress.length > 0) {
      habbit.progress[0].done = true;
    }
  }

  db[idx] = habbit;
  await save(db);

  console.log(`Progress for habit with id ${id} updated successfully.`);
  return habbit;
}

export async function updateById(id, payload) {
  const db = await read();

  const idx = db.findIndex((u) => u.id == id);
  if (idx === -1) {
    console.log(`Habit with id ${id} not found.`);
    return null;
  }

  const habbit = db[idx];

  let updatedHabbit = {
    ...habbit,
    ...(payload.name && { name: payload.name }),
    ...(payload.freq && { freq: payload.freq }),
  };

  if (payload.freq && payload.freq != habbit.freq) {
    let progress = [];
    if (payload.freq === "daily") {
      progress = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        done: false,
      }));
    } else if (payload.freq === "weekly") {
      progress = Array.from({ length: 4 }, (_, i) => ({
        week: i + 1,
        done: false,
      }));
    } else if (payload.freq === "monthly") {
      progress = [{ month: 1, done: false }];
    }
    updatedHabbit = { ...updatedHabbit, progress };
  }

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
