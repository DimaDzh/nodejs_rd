import { Injectable } from "../../core/decorators";

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
    return this.#data.find((b) => b.id === id);
  }
  create(title: string, desription: string, technologies: string[]) {
    const course = { id: Date.now(), title, desription, technologies };
    this.#data.push(course);
    return course;
  }
}
