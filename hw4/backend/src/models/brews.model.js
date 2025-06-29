import { nanoid } from "nanoid";

export class BrewModel {
  static scope = "singleton";
  #store = new Map();

  constructor() {
    console.log(`BrewsModel initialized`);
  }

  all() {
    return [...this.#store.values()];
  }

  find(id) {
    return this.#store.get(id) ?? null;
  }

  create(dto) {
    const id = nanoid(8);
    const defaultAt = new Date().toISOString();

    const brew = {
      id,
      beans: dto.beans,
      method: dto.method,
      rating: dto.rating || null,
      notes: dto.notes || "",
      brewedAt: dto.brewedAt ? dto.brewedAt : defaultAt,
    };

    this.#store.set(id, brew);
    return brew;
  }

  update(id, dto) {
    if (!this.#store.has(id)) return null;
    const brew = { id, ...dto };
    this.#store.set(id, brew);
    return brew;
  }

  remove(id) {
    return this.#store.delete(id);
  }
}
