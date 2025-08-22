import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomLoggerService } from './common/logger.service';

describe('AppController', () => {
  let appController: AppController;
  let loggerSpy: jest.Mocked<CustomLoggerService>;

  beforeEach(async () => {
    // Create a spy for the logger service
    loggerSpy = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CustomLoggerService,
          useValue: loggerSpy,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();

      expect(result).toBe('Hello World!');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledWith(
        'Hello World requested!',
        'AppService',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerSpy.log).toHaveBeenCalledTimes(1);
    });
  });
});
