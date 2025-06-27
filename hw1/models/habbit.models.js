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

  const habbit = { id: Date.now().toString(), ...payload, progress };
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
    const day = payload.day;
    if (day < 1 || day > 30) {
      console.log("Invalid day for daily habit:", day);
      return null;
    }

    // Update progress where day matches
    const progress = habbit.progress.map((p) =>
      p.day == day ? { ...p, done: true } : p
    );

    db[idx] = { ...habbit, progress };
    await save(db);
    console.log(`Habit with id ${id} updated successfully.`);
    return db[idx];
  }
  if (habbit.freq === "weekly") {
    const week = payload.week;
    if (week < 1 || week > 4) {
      console.log("Invalid week for weekly habit:", week);
      return null;
    }

    // Update progress where week matches
    const progress = habbit.progress.map((p) =>
      p.week == week ? { ...p, done: true } : p
    );

    db[idx] = { ...habbit, progress };
    await save(db);
    console.log(`Habit with id ${id} updated successfully.`);
    return db[idx];
  }
  if (habbit.freq === "monthly") {
    // Monthly habits are not updated by day or week, just mark as done
    db[idx] = { ...habbit, done: true };
    await save(db);
    console.log(`Habit with id ${id} updated successfully.`);
    return db[idx];
  }

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
