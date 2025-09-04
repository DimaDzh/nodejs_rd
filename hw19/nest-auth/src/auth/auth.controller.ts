import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import {
  LoginResponse,
  TokenPair,
  JwtPayload,
} from './interfaces/auth.interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto?: LoginDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<LoginResponse> {
    // Check if Basic Auth header is provided
    if (authHeader && authHeader.startsWith('Basic ')) {
      return this.authService.loginWithBasicAuth(authHeader);
    }

    // Check if JSON body is provided
    if (loginDto && loginDto.email && loginDto.password) {
      return this.authService.login(loginDto);
    }

    throw new BadRequestException(
      'Either provide JSON body with email and password, or Authorization header with Basic auth',
    );
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto): Promise<TokenPair> {
    return this.authService.refresh(refreshDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: JwtPayload }) {
    return {
      id: req.user.sub,
      email: req.user.email,
      iat: req.user.iat,
      exp: req.user.exp,
    };
  }
}
