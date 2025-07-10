import { Module } from "../../core/decorators";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
