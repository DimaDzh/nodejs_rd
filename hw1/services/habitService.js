// services/habitService.js
import {
  readDatabase,
  writeDatabase,
  generateId,
  getTodayDate,
  getPastDates,
} from "../models/habitModel.js";

export async function addHabitService(name, freq) {
  const db = await readDatabase();
  const newHabit = {
    id: generateId(),
    name,
    freq,
    createdAt: getTodayDate(),
    done: [],
  };
  db.habits.push(newHabit);
  await writeDatabase(db);
}

export async function getAllHabits() {
  const db = await readDatabase();
  return db.habits;
}

export async function markHabitAsDone(id) {
  const db = await readDatabase();
  const habit = db.habits.find((h) => h.id === Number(id));

  if (!habit) throw new Error("Habit not found");

  habit.done = true;

  await writeDatabase(db);
}

export async function deleteHabitService(id) {
  const db = await readDatabase();
  db.habits = db.habits.filter((h) => h.id !== Number(id));
  await writeDatabase(db);
}

export async function updateHabitService(id, { name, freq }) {
  const db = await readDatabase();
  const habit = db.habits.find((h) => h.id === Number(id));
  if (!habit) throw new Error("Habit not found");

  if (name) habit.name = name;
  if (freq) habit.freq = freq;

  await writeDatabase(db);
}

export async function calculateStatsService() {
  const db = await readDatabase();
  const today = new Date();
  const range = 7; // або 30
  const pastDates = getPastDates(today, range);

  return db.habits.map((habit) => {
    const count = habit.done.filter((date) => pastDates.includes(date)).length;
    const percentage = Math.round((count / range) * 100);
    return {
      ...habit,
      donePercentage: percentage,
    };
  });
}
