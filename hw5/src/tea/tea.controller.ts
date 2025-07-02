import {
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TeaService } from "./tea.service";
import {
  CreateTeaDto,
  TeaSchema,
  UpdateTeaDto,
  UpdateTeaSchema,
} from "./dto/tea.dto";
import { ZBody } from "./tea.decorators";
import { Public } from "src/shared/decorators/public.decorator";

@ApiTags("Tea")
@Controller("tea")
export class TeaController {
  constructor(private readonly tea: TeaService) {}

  @Public()
  @Get()
  findAll(
    @Query("minRating") minRating?: number,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number
  ) {
    return this.tea.findAll(minRating, page, pageSize);
  }
  @Public()
  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.tea.findOne(id);
  }

  @Post()
  create(@ZBody(TeaSchema) dto: CreateTeaDto) {
    return this.tea.create(dto);
  }

  @Put(":id")
  update(@Param("id") id: number, @ZBody(UpdateTeaSchema) dto: UpdateTeaDto) {
    if (!id) {
      throw new Error("ID is required for update");
    }
    return this.tea.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    this.tea.remove(+id);
    return { deleted: true };
  }
}
