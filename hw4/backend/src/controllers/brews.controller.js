export class BrewsController {
  static scope = "scoped";

  constructor(brewsService) {
    this.brewsService = brewsService;
  }

  index = (req, res) => {
    const { method, ratingMin } = req.validatedQuery || req.query;

    const filters = {};
    if (method) filters.method = method;
    if (ratingMin !== undefined) filters.ratingMin = ratingMin;

    const brews = this.brewsService.getAll(filters);
    res.json(brews);
  };

  show = (req, res, next) => {
    try {
      const brew = this.brewsService.getOne(req.params.id);
      res.json(brew);
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  };

  create = (req, res, next) => {
    try {
      const brew = this.brewsService.create(req.body);
      res.status(201).json(brew);
    } catch (error) {
      next(error);
    }
  };

  update = (req, res, next) => {
    try {
      const brew = this.brewsService.update(req.params.id, req.body);
      res.json(brew);
    } catch (error) {
      next(error);
    }
  };

  remove = (req, res, next) => {
    try {
      this.brewsService.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
