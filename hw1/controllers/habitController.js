// controllers/habitController.js
import {
  readDatabase,
  writeDatabase,
  generateId,
  getTodayDate,
  getPastDates,
} from "../models/habitModel.js";

export async function addHabit(name, freq) {
  const db = await readDatabase();
  const newHabit = {
    id: generateId(),
    name,
    freq,
    createdAt: getTodayDate(),
    done: false,
  };
  db.habits.push(newHabit);
  await writeDatabase(db);
  console.log(`Habit "${name}" added.`);
}

export async function listHabits() {
  const db = await readDatabase();

  console.table(
    db.habits.map(({ id, name, freq, createdAt }) => ({
      id,
      name,
      freq,
      createdAt,
    }))
  );
}

export async function markDone(id) {
  const db = await readDatabase();
  const habit = db.habits.find((h) => h.id == id);
  if (!habit) {
    console.log(`Habit with ID ${id} not found.`);
    return;
  }

  const today = getTodayDate();
  if (!habit.history.includes(today)) {
    habit.history.push(today);
    await writeDatabase(db);
    console.log(`Habit "${habit.name}" marked as done today.`);
  } else {
    console.log(`ℹHabit "${habit.name}" already marked as done today.`);
  }
}

export async function deleteHabit(id) {
  const db = await readDatabase();
  const index = db.habits.findIndex((h) => h.id == id);
  if (index === -1) {
    console.log(`Habit with ID ${id} not found.`);
    return;
  }
  const removed = db.habits.splice(index, 1);
  await writeDatabase(db);
  console.log(`Habit "${removed[0].name}" deleted.`);
}

export async function updateHabit(id, name, freq) {
  const db = await readDatabase();
  const habit = db.habits.find((h) => h.id == id);
  if (!habit) {
    console.log(`Habit with ID ${id} not found.`);
    return;
  }

  if (name) habit.name = name;
  if (freq) habit.freq = freq;
  await writeDatabase(db);
  console.log(`Habit "${habit.name}" updated.`);
}

export async function showStats() {
  const db = await readDatabase();
  db.habits.forEach((habit) => {
    const period =
      habit.freq === "daily"
        ? 7
        : habit.freq === "weekly"
        ? 30
        : habit.freq === "monthly"
        ? 30
        : 7;

    const pastDates = getPastDates(new Date(), period);
    const count = pastDates.filter((d) => habit.history.includes(d)).length;
    const percent = ((count / period) * 100).toFixed(1);
    console.log(
      `"${habit.name}" — ${percent}% completion over last ${period} days`
    );
  });
}
