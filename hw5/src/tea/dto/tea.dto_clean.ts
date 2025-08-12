import { z } from "zod";

export const TeaSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(3).max(40),
  origin: z.string().min(2).max(30),
  rating: z.number().min(1).max(10).optional(),
  brewTemp: z.number().min(6).max(100).optional(),
  notes: z.string().max(150).optional(),
});

export const TeaQuerySchema = z.object({
  minRating: z.number().int().min(1).max(10).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

export type CreateTeaDto = z.infer<typeof TeaSchema>;

export const UpdateTeaSchema = TeaSchema.partial();
export type UpdateTeaDto = z.infer<typeof UpdateTeaSchema>;
