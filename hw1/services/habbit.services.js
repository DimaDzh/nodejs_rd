import * as HabbitModels from "../models/habbit.models.js";

export const list = () => HabbitModels.getAll();
export const add = (body) => HabbitModels.create(body);
export const deleteUser = (id) => HabbitModels.remove(id);
export const updateProgressById = (id, payload) =>
  HabbitModels.updateProgressById(id, payload);
export const updateById = (id, payload) => HabbitModels.updateById(id, payload);
export const stats = () => HabbitModels.getStats();
