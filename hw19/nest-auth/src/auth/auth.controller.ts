import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/auth.interfaces';

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
}
