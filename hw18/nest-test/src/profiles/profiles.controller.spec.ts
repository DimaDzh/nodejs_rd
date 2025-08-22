import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

describe('ProfilesController (Integration)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    profile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    // Enable validation pipe for DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('POST /profiles', () => {
    const validProfileDto: CreateProfileDto = {
      email: 'test@example.com',
      displayName: 'Test User',
      age: 25,
    };

    const mockCreatedProfile = {
      id: 1,
      email: 'test@example.com',
      displayName: 'Test User',
      age: 25,
    };

    it('should create a profile with valid data and return 201 with JSON containing id', async () => {
      mockPrismaService.profile.create.mockResolvedValue(mockCreatedProfile);

      const response = await request(app.getHttpServer())
        .post('/profiles')
        .send(validProfileDto)
        .expect(201);

      // Verify response format and content
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: validProfileDto.email,
        displayName: validProfileDto.displayName,
        age: validProfileDto.age,
      });

      // Verify the id is present and is a number
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('number');

      // Verify service was called correctly
      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: validProfileDto,
      });
    });

    describe('DTO Validation Errors', () => {
      it('should return 400 for invalid email format', async () => {
        const invalidEmailData = {
          email: 'invalid-email',
          displayName: 'Test User',
          age: 25,
        };

        const response = await request(app.getHttpServer())
          .post('/profiles')
          .send(invalidEmailData)
          .expect(400);

        expect(response.body).toMatchObject({
          statusCode: 400,
          message: expect.arrayContaining([
            'Email must be a valid email address',
          ]),
          error: 'Bad Request',
        });
      });
    });

    describe('Response Format Validation', () => {
      it('should return JSON response with expected structure', async () => {
        mockPrismaService.profile.create.mockResolvedValue(mockCreatedProfile);

        const response = await request(app.getHttpServer())
          .post('/profiles')
          .send(validProfileDto)
          .expect(201)
          .expect('Content-Type', /json/);

        // Verify all expected fields are present
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('displayName');
        expect(response.body).toHaveProperty('age');

        // Verify field types
        expect(typeof response.body.id).toBe('number');
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body.displayName).toBe('string');

        // Age can be number or null
        expect(
          typeof response.body.age === 'number' || response.body.age === null,
        ).toBe(true);
      });
    });
  });
});
