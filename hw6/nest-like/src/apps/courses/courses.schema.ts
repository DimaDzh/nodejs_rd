import { z } from "zod";

export const coursesSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  technologies: z
    .array(z.string())
    .min(1, { message: "At least one technology is required" }),
});
