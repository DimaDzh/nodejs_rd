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
    const brew = { id, ...dto };
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
