import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(() => {
    authGuard = new AuthGuard();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should return true for valid Bearer test token', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer test',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = authGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest['user']).toEqual({ username: 'test-user' });
  });

  it('should throw UnauthorizedException for missing authorization header', () => {
    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => authGuard.canActivate(mockContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for invalid token', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => authGuard.canActivate(mockContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for wrong authorization type', () => {
    const mockRequest = {
      headers: {
        authorization: 'Basic test',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    expect(() => authGuard.canActivate(mockContext)).toThrow(
      UnauthorizedException,
    );
  });
});
