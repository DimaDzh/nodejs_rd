import {
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiOperation,
  ApiBody,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  CreateTeaDto as CreateTeaDtoSwagger,
  UpdateTeaDto as UpdateTeaDtoSwagger,
  TeaResponse as TeaResponseSwagger,
} from "../shared/dto/swagger.dto";

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
  @ApiOperation({ summary: "Get all teas" })
  @ApiResponse({
    status: 200,
    description: "List of teas with pagination",
    type: TeaResponseSwagger,
  })
  @ApiResponse({
    status: 429,
    description:
      "Too Many Requests - Rate limit exceeded (max 10 requests per minute)",
  })
  @ApiQuery({
    name: "minRating",
    required: false,
    type: "number",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: "number",
  })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: "number",
  })
  findAll(
    @Query("minRating")
    minRating?: number,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number
  ) {
    return this.tea.findAll(minRating, page, pageSize);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get tea by ID" })
  @ApiResponse({
    status: 200,
    description: "Tea found",
    type: TeaResponseSwagger,
  })
  @ApiResponse({
    status: 404,
    description: "Tea not found",
  })
  @ApiResponse({
    status: 429,
    description:
      "Too Many Requests - Rate limit exceeded (max 10 requests per minute)",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.tea.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Create new tea" })
  @ApiBody({ type: CreateTeaDtoSwagger })
  @ApiResponse({
    status: 201,
    description: "Tea created successfully",
    type: TeaResponseSwagger,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - API key required",
  })
  @ApiResponse({
    status: 429,
    description:
      "Too Many Requests - Rate limit exceeded (max 5 requests per minute for create operations)",
  })
  create(@ZBody(TeaSchema) dto: CreateTeaDto) {
    return this.tea.create(dto);
  }

  @Put(":id")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Update tea by ID" })
  @ApiBody({ type: UpdateTeaDtoSwagger })
  @ApiResponse({
    status: 200,
    description: "Tea updated successfully",
    type: TeaResponseSwagger,
  })
  @ApiResponse({
    status: 404,
    description: "Tea not found",
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - API key required",
  })
  @ApiResponse({
    status: 429,
    description:
      "Too Many Requests - Rate limit exceeded (max 5 requests per minute for update operations)",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @ZBody(UpdateTeaSchema) dto: UpdateTeaDto
  ) {
    return this.tea.update(id, dto);
  }

  @Delete(":id")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Delete tea by ID" })
  @ApiResponse({
    status: 200,
    description: "Tea deleted successfully",
    schema: {
      type: "object",
      properties: {
        deleted: { type: "boolean", example: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Tea not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - API key required",
  })
  @ApiResponse({
    status: 429,
    description:
      "Too Many Requests - Rate limit exceeded (max 3 requests per minute for delete operations)",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    this.tea.remove(id);
    return { deleted: true };
  }
}
