import { Injectable } from "@nestjs/common";
import { Tea } from "./entities/tea.entity";
import {
  TeaSchema,
  UpdateTeaSchema,
  CreateTeaDto,
  UpdateTeaDto,
} from "./dto/tea.dto";

@Injectable()
export class TeaService {
  private teas: Tea[] = [];

  findAll(
    minRating?: number,
    page: number = 1,
    pageSize: number = 10
  ): { data: Tea[]; total: number; page: number; pageSize: number } {
    let filteredTeas = this.teas;

    if (minRating !== undefined) {
      filteredTeas = filteredTeas.filter(
        (tea) => tea.rating && tea.rating >= minRating
      );
    }

    filteredTeas = filteredTeas.sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    const total = filteredTeas.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTeas = filteredTeas.slice(startIndex, endIndex);

    return {
      data: paginatedTeas,
      total,
      page,
      pageSize,
    };
  }

  findOne(id: number): Tea {
    const tea = this.teas.find((tea) => Number(tea.id) === Number(id));
    if (!tea) {
      throw new Error(`Tea with ID ${id} not found`);
    }
    return tea;
  }

  create(dto: CreateTeaDto) {
    const parsedDto = TeaSchema.parse(dto);

    const tea = { id: Date.now(), ...parsedDto } as Tea;
    this.teas.push(tea);
    return tea;
  }

  update(id: number, dto: UpdateTeaDto): Tea | undefined {
    const tea = this.findOne(id);
    if (!tea) {
      throw new Error(`Tea with ID ${id} not found`);
    }

    const parsedDto = UpdateTeaSchema.parse(dto);

    Object.assign(tea, parsedDto);
    return tea;
  }

  remove(id: number) {
    this.teas = this.teas.filter((u) => u.id !== id);
  }
}
