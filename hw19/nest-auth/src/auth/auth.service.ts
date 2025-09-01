import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import {
  JwtPayload,
  TokenPair,
  LoginResponse,
} from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const tokenPair = await this.generateTokens(payload);

    return {
      ...tokenPair,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
      },
    };
  }

  async loginWithBasicAuth(authHeader: string): Promise<LoginResponse> {
    // Parse Basic Auth header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      throw new UnauthorizedException('Invalid Basic Auth format');
    }

    return this.login({ email, password });
  }

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
        expiresIn: '15m', // Short-lived access token
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: '7d', // Long-lived refresh token
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
