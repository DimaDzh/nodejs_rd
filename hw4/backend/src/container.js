import { createContainer, asClass } from "awilix";
import { BrewModel } from "./models/brews.model.js";
import { BrewsService } from "./services/brews.service.js";
import { BrewsController } from "./controllers/brews.controller.js";
import { objectMap } from "./utils/Object.map.js";

const brewsModule = {
  // DATA
  brewsModel: BrewModel,
  // BUSINESS
  brewsService: BrewsService,
  // HTTP
  brewsController: BrewsController,
};

/**
 * injectionMode: ‘CLASSIC’ означає:
 * Awilix дивиться імена параметрів конструктора і підставляє
 * відповідні реєстраційні токени.
 */

export const container = createContainer({ injectionMode: "CLASSIC" }).register(
  objectMap(brewsModule, (value) => asClass(value)[value.scope]())
);
