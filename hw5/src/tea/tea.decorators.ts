import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema } from "zod";

export const ZBody = (schema: ZodSchema) => {
  return createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    try {
      return await schema.parseAsync(body);
    } catch (error: any) {
      throw new BadRequestException(error.errors || "Invalid request body");
    }
  })();
};
