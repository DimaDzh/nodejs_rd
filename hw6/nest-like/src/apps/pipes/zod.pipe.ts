import { ZodSchema } from "zod";
import { ArgumentMetadata } from "../../core/types";
import { PipeTransform } from "../../core/decorators";
import { BadRequestException } from "../../core/exeptions";

export class ZodValidationPipe implements PipeTransform<any, any> {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, meta: ArgumentMetadata) {
    try {
      return this.schema.parse(value); // ✅ OK – повертаємо чисті дані
    } catch (err) {
      /*  ↳ у продакшн-коді краще кидати свій HttpError із статусом 400   */
      throw new BadRequestException(
        `Validation failed for ${meta.type}${
          meta.data ? ` (${meta.data})` : ""
        }`
      );
    }
  }
}
