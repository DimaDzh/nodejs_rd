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

@Controller("/courses")
@UseGuards(RolesGuard)
export class CoursesController {
  constructor(private svc: CoursesService) {}

  @Get("/")
  list() {
    return this.svc.findAll();
  }

  @Get("/:id")
  one(@Param("id") id: string) {
    return this.svc.findOne(+id);
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
