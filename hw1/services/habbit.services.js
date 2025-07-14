import * as HabbitModels from "../models/habbit.models.js";
import process from "node:process";
import dotenv from "dotenv";
import { getStartOfDay, generateProgress } from "../helpers/index.js";
dotenv.config();

const OFFSET = process.env.OFFSET;

export const list = () => HabbitModels.getAll();

export const add = (body) => {
  try {
    let newBody = { ...body };
    const today = getStartOfDay();

    const progress = generateProgress(body.freq, today);
    newBody = { ...newBody, progress };

    HabbitModels.create(newBody);

    return newBody;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw new Error("Failed to add habit");
  }
};
export const deleteUser = (id) => HabbitModels.remove(id);

export const updateProgressById = async (id) => {
  const offset = OFFSET ? parseInt(OFFSET, 10) : 0;
  const today = getStartOfDay();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + offset);
  const targetTimestamp = targetDate.getTime();

  const habits = await HabbitModels.getAll();
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    console.log(`Habit with id ${id} not found.`);
    return null;
  }

  const updatedProgress = habit.progress.map((p) => {
    let matchCondition = false;

    if (p.timestamp) {
      const targetDateStr = new Date(targetTimestamp).toDateString();
      const progressDateStr = new Date(p.timestamp).toDateString();
      matchCondition = targetDateStr === progressDateStr;
    }

    return matchCondition ? { ...p, done: true } : p;
  });

  return HabbitModels.updateProgressById(id, updatedProgress);
};

export const updateById = (id, payload) => {
  let updatedHabbit = {
    ...(payload.name && { name: payload.name }),
    ...(payload.freq && { freq: payload.freq }),
  };

  if (payload.freq) {
    const today = getStartOfDay();
    const progress = generateProgress(payload.freq, today);
    updatedHabbit = {
      ...updatedHabbit,
      progress: progress,
    };
  }

  HabbitModels.updateById(id, updatedHabbit);
};

export const stats = async () => {
  const habits = await HabbitModels.getStats();

  const stats = habits.map((habbit) => {
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
      completed =
        habbit.progress && habbit.progress.length > 0
          ? habbit.progress.filter((p) => p.done).length
          : habbit.done
          ? 1
          : 0;
    }

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      id: habbit.id,
      name: habbit.name,
      freq: habbit.freq,
      completed,
      total,
      percentage: percentage.toFixed(2) + "%",
    };
  });

  console.table(
    stats.map((stat) => ({
      "Habit ID": stat.id,
      Name: stat.name,
      Frequency: stat.freq,
      Completed: `${stat.completed}/${stat.total}`,
      Percentage: stat.percentage,
    }))
  );

  return stats;
};
