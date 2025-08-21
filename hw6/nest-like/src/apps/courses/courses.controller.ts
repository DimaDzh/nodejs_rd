import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  UseGuards,
} from "../../core/decorators";
import { ZodValidationPipe } from "../pipes/zod.pipe";
import { CoursesService } from "./courses.service";
import { coursesSchema } from "./courses.schema";
import { ICourse } from "src/core/types";
import { Roles, RolesGuard } from "../guards/roles.guard";
import { UseFilter } from "../../core/filters/use-filter";
import { BadRequestException, NotFoundException } from "../../core/exeptions";
import { HttpExceptionFilter } from "../../core/filters/http-exception.filter";
@Controller("/courses")
@UseGuards(RolesGuard)
@UseFilter(HttpExceptionFilter)
export class CoursesController {
  constructor(private svc: CoursesService) {}

  @Get("/")
  list() {
    return this.svc.findAll();
  }

  @Get("/:id")
  one(@Param("id") id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException(
        "Invalid ID parameter. ID must be a number."
      );
    }
    return this.svc.findOne(numericId);
  }

  @Post("/")
  @UsePipes(new ZodValidationPipe(coursesSchema))
  add(
    @Body()
    body: ICourse
  ) {
    return this.svc.create(body.title, body.description, body.technologies);
  }
}
