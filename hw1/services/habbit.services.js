import * as HabbitModels from "../models/habbit.models.js";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const OFFSET = process.env.OFFSET;

export const list = () => HabbitModels.getAll();
export const add = (body) => {
  try {
    let progress = [];
    let newBody = { ...body };
    if (body.freq === "daily") {
      progress = Array.from({ length: 30 }, (_, i) => ({
        item: i + 1,
        done: false,
      }));
    } else if (body.freq === "weekly") {
      progress = Array.from({ length: 4 }, (_, i) => ({
        item: i + 1,
        done: false,
      }));
    } else if (body.freq === "monthly") {
      progress = [{ item: 1, done: false }];
    }
    newBody = { ...newBody, progress };

    HabbitModels.create(newBody);

    return newBody;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw new Error("Failed to add habit");
  }
};
export const deleteUser = (id) => HabbitModels.remove(id);

export const updateProgressById = (id) => {
  const updatedProgress = {
    item: OFFSET ? parseInt(OFFSET, 10) : 1,
    done: true,
  };

  HabbitModels.updateProgressById(id, updatedProgress);
};

export const updateById = (id, payload) => {
  let updatedHabbit = {
    ...(payload.name && { name: payload.name }),
    ...(payload.freq && { freq: payload.freq }),
  };

  if (payload.freq) {
    let progress = [];
    if (payload.freq === "daily") {
      progress = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        done: false,
      }));
      updatedHabbit = {
        ...updatedHabbit,
        progress: progress,
      };
    } else if (payload.freq === "weekly") {
      progress = Array.from({ length: 4 }, (_, i) => ({
        week: i + 1,
        done: false,
      }));
      updatedHabbit = {
        ...updatedHabbit,
        progress: progress,
      };
    } else if (payload.freq === "monthly") {
      progress = [{ month: 1, done: false }];
      updatedHabbit = {
        ...updatedHabbit,
        progress: progress,
      };
    }
  }
  HabbitModels.updateById(id, updatedHabbit);
};
export const stats = () => HabbitModels.getStats();
0;
