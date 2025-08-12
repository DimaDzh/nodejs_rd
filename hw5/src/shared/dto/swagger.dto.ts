import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTeaDtoSwagger {
  @ApiProperty({
    description: "Tea name",
    minLength: 3,
    maxLength: 40,
    example: "Earl Grey",
  })
  name!: string;

  @ApiProperty({
    description: "Tea origin",
    minLength: 2,
    maxLength: 30,
    example: "Ceylon",
  })
  origin!: string;

  @ApiPropertyOptional({
    description: "Tea rating",
    minimum: 1,
    maximum: 10,
    example: 8,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: "Brewing temperature in Celsius",
    minimum: 6,
    maximum: 100,
    example: 85,
  })
  brewTemp?: number;

  @ApiPropertyOptional({
    description: "Additional notes",
    maxLength: 150,
    example: "Great with milk and honey",
  })
  notes?: string;
}

export class UpdateTeaDtoSwagger {
  @ApiPropertyOptional({
    description: "Tea name",
    minLength: 3,
    maxLength: 40,
    example: "Earl Grey",
  })
  name?: string;

  @ApiPropertyOptional({
    description: "Tea origin",
    minLength: 2,
    maxLength: 30,
    example: "Ceylon",
  })
  origin?: string;

  @ApiPropertyOptional({
    description: "Tea rating",
    minimum: 1,
    maximum: 10,
    example: 8,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: "Brewing temperature in Celsius",
    minimum: 6,
    maximum: 100,
    example: 85,
  })
  brewTemp?: number;

  @ApiPropertyOptional({
    description: "Additional notes",
    maxLength: 150,
    example: "Great with milk and honey",
  })
  notes?: string;
}

export class TeaResponseSwagger {
  @ApiProperty({
    description: "Tea ID",
    example: 1647891234567,
  })
  id!: number;

  @ApiProperty({
    description: "Tea name",
    example: "Earl Grey",
  })
  name!: string;

  @ApiProperty({
    description: "Tea origin",
    example: "Ceylon",
  })
  origin!: string;

  @ApiPropertyOptional({
    description: "Tea rating",
    example: 8,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: "Brewing temperature in Celsius",
    example: 85,
  })
  brewTemp?: number;

  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Great with milk and honey",
  })
  notes?: string;
}

export class TeaListResponseSwagger {
  @ApiProperty({
    description: "Array of tea items",
    type: [TeaResponseSwagger],
  })
  data!: TeaResponseSwagger[];

  @ApiProperty({
    description: "Total number of items",
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: "Current page",
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
  })
  pageSize!: number;
}
