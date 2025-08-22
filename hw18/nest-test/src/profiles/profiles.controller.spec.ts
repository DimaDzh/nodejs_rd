import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CustomLoggerService } from '../common/logger.service';
import { CreateProfileDto } from './dto/create-profile.dto';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let loggerSpy: jest.Mocked<CustomLoggerService>;

  const mockProfilesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    // Create logger spy
    loggerSpy = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
        {
          provide: CustomLoggerService,
          useValue: loggerSpy,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProfileDto: CreateProfileDto = {
      email: 'a@b.io',
      displayName: 'Ann',
    };

    const mockCreatedProfile = {
      id: 1,
      email: 'a@b.io',
      displayName: 'Ann',
      age: null,
    };

    it('should create a profile and log profile.created event', async () => {
      mockProfilesService.create.mockResolvedValue(mockCreatedProfile);

      const result = await controller.create(createProfileDto);

      expect(result).toEqual(mockCreatedProfile);
      expect(mockProfilesService.create).toHaveBeenCalledWith(createProfileDto);

      // Verify logger.log was called with correct parameters
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledWith('profile.created', {
        id: 1,
        email: 'a@b.io',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledTimes(1);
    });

    it('should log error when BadRequestException is thrown', async () => {
      const badRequestError = new BadRequestException('Invalid data');
      mockProfilesService.create.mockRejectedValue(badRequestError);

      await expect(controller.create(createProfileDto)).rejects.toThrow(
        BadRequestException,
      );

      // Verify logger.error was called
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Invalid request body for profile creation',
        'Invalid data',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.error).toHaveBeenCalledTimes(1);

      // Verify logger.log was NOT called since creation failed
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).not.toHaveBeenCalled();
    });

    it('should not log error for other types of exceptions', async () => {
      const otherError = new Error('Database connection failed');
      mockProfilesService.create.mockRejectedValue(otherError);

      await expect(controller.create(createProfileDto)).rejects.toThrow(Error);

      // Verify logger.error was NOT called for non-BadRequestException
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.error).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).not.toHaveBeenCalled();
    });

    it('should log profile.created with correct object structure', async () => {
      const mockProfile = {
        id: 42,
        email: 'test@example.com',
        displayName: 'Test User',
        age: 30,
      };
      mockProfilesService.create.mockResolvedValue(mockProfile);

      await controller.create({
        email: 'test@example.com',
        displayName: 'Test User',
        age: 30,
      });

      // Verify logger.log was called with object containing correct fields
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledWith(
        'profile.created',
        expect.objectContaining({
          id: 42,
          email: 'test@example.com',
        }),
      );

      // Verify the call was made exactly once
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledTimes(1);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
