import { mergeSpecs } from "./merge-specs.js";
import { createZodSpec } from "./openapi.js";
import { jsdocSpec } from "./swagger.js";

export const generateSpecs = () => {
  return mergeSpecs(jsdocSpec, createZodSpec());
};
