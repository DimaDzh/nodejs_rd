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
        day: i + 1,
        done: false,
      }));
    } else if (body.freq === "weekly") {
      progress = Array.from({ length: 4 }, (_, i) => ({
        week: i + 1,
        done: false,
      }));
    } else if (body.freq === "monthly") {
      progress = [{ month: 1, done: false }];
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

export const updateProgressById = (id, payload) => {
  HabbitModels.updateProgressById(id, payload);
};

export const updateById = (id, payload) => HabbitModels.updateById(id, payload);
export const stats = () => HabbitModels.getStats();
