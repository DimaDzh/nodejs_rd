import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Prisma } from '../../generated/prisma';

describe('ProfilesService', () => {
  let service: ProfilesService;

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
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProfileDto: CreateProfileDto = {
      email: 'test@example.com',
      displayName: 'Test User',
      age: 25,
    };

    const mockProfile = {
      id: 1,
      email: 'test@example.com',
      displayName: 'Test User',
      age: 25,
    };

    it('should create a profile and return it with id', async () => {
      mockPrismaService.profile.create.mockResolvedValue(mockProfile);

      const result = await service.create(createProfileDto);

      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: createProfileDto,
      });
      expect(result).toEqual(mockProfile);
      expect(result.id).toBeDefined();
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: {
            target: ['email'],
          },
        },
      );

      mockPrismaService.profile.create.mockRejectedValue(prismaError);

      await expect(service.create(createProfileDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createProfileDto)).rejects.toThrow(
        'Profile with this email already exists',
      );

      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: createProfileDto,
      });
    });

    it('should rethrow unknown errors', async () => {
      const unknownError = new Error('Database connection failed');
      mockPrismaService.profile.create.mockRejectedValue(unknownError);

      await expect(service.create(createProfileDto)).rejects.toThrow(
        unknownError,
      );
    });
  });

  describe('findById', () => {
    const mockProfile = {
      id: 1,
      email: 'test@example.com',
      displayName: 'Test User',
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a profile by id', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.findOne(1);

      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Profile with id 999 not found',
      );

      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });
});
