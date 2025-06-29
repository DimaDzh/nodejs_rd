import { Router } from "express";
import { z } from "zod";
import { makeClassInvoker } from "awilix-express";

import { BrewsController } from "../controllers/brews.controller.js";
import { BrewsDTO } from "../dto/brews.dto.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { registry } from "../openapi/registry.js";
import { validate } from "../middlewares/validate.js";
import { validateParams } from "../middlewares/validateParams.js";

const router = Router();
const ctl = makeClassInvoker(BrewsController);

const paramsSchema = z.object({
  id: z.string().describe("Coffee ID"),
});

//Get all
router.get("/brews", ctl("index"));
registry.registerPath({
  method: "get",
  path: "/api/brews",
  tags: ["Brews"],
  responses: {
    200: {
      description: "Array of brews",
      content: { "application/json": { schema: z.array(BrewsDTO) } },
    },
  },
});

//Get by ID
router.get("/brews/:id", validateParams(paramsSchema), ctl("show"));
registry.registerPath({
  method: "get",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: { params: paramsSchema },
  responses: {
    200: {
      description: "Brew details",
      content: { "application/json": { schema: BrewsDTO } },
    },
    404: { description: "Brew not found" },
  },
});

//Post a new brew
router.post("/brews", validate(BrewsDTO), asyncHandler(ctl("create")));
registry.registerPath({
  method: "post",
  path: "/api/brews",
  tags: ["Brews"],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: BrewsDTO } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: BrewsDTO } },
    },
    400: { description: "Validation error" },
  },
});

//Put
router.put(
  "/brews/:id",
  validateParams(paramsSchema),
  validate(BrewsDTO),
  asyncHandler(ctl("update"))
);
registry.registerPath({
  method: "put",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: {
    params: paramsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: BrewsDTO } },
    },
  },
  responses: {
    200: {
      description: "Updated brews",
      content: { "application/json": { schema: BrewsDTO } },
    },
    400: { description: "Validation error" },
    404: { description: "Brew not found" },
  },
});

//Delete
router.delete("/brews/:id", asyncHandler(ctl("remove")));
registry.registerPath({
  method: "delete",
  path: "/api/brews/{id}",
  tags: ["Brews"],
  request: { params: paramsSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Brew not found" },
  },
});

export { router };
