import { Injectable } from "../../core/decorators";
import { NotFoundException, BadRequestException } from "../../core/exeptions";

export interface Course {
  id: number;
  title: string;
  desription: string;
  technologies: string[];
}

@Injectable()
export class CoursesService {
  #data: Course[] = [
    {
      id: 1,
      title: "Nest",
      desription: "NestJS Course",
      technologies: ["Node.js", "Express", "TypeScript"],
    },
  ];
  findAll() {
    return this.#data;
  }
  findOne(id: number) {
    // Validate that id is a positive number
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(
        "Invalid course ID. ID must be a positive number."
      );
    }

    const course = this.#data.find((b) => b.id === id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }
  create(title: string, desription: string, technologies: string[]) {
    const course = { id: Date.now(), title, desription, technologies };
    this.#data.push(course);
    return course;
  }
}
