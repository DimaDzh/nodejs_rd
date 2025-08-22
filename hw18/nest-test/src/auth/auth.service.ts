import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn(username: string, password: string) {
    // Simple mock authentication - not needed for our AuthGuard test
    if (username === 'test' && password === 'test') {
      return {
        access_token: 'test-token',
        username: 'test',
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
