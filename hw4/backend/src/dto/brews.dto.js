import { z } from "zod";
import { registry } from "../openapi/registry.js";

export const BrewsDTO = z.object({
  beans: z.string().min(3).max(40),
  method: z.enum(["v60", "aeropress", "chemex", "espresso"]),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(200).optional(),
  brewedAt: z.string().datetime().optional(),
});
/* реєструємо схему */
registry.register("Brews", BrewsDTO);
