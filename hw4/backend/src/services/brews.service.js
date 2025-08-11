export class BrewsService {
  static scope = "scoped";
  constructor(brewsModel) {
    console.log(`BrewService initialized`);
    this.brewsModel = brewsModel;
  }

  getAll(filters = {}) {
    let brews = this.brewsModel.all();

    if (filters.method) {
      brews = brews.filter((brew) => brew.method === filters.method);
    }

    if (filters.ratingMin !== undefined) {
      brews = brews.filter(
        (brew) => brew.rating && brew.rating >= filters.ratingMin
      );
    }

    return brews;
  }

  getOne(id) {
    const brew = this.brewsModel.find(id);
    if (!brew)
      throw Object.assign(new Error("Brew not found"), { status: 404 });
    return brew;
  }

  create(dto) {
    return this.brewsModel.create(dto);
  }

  update(id, dto) {
    const brew = this.brewsModel.update(id, dto);
    if (!brew)
      throw Object.assign(new Error("Brew not found"), { status: 404 });
    return brew;
  }

  delete(id) {
    if (!this.brewsModel.remove(id))
      throw Object.assign(new Error("Brew not found"), { status: 404 });
  }
}
