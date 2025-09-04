import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends TokenPair {
  user: {
    id: number;
    email: string;
    name?: string;
    role: Role;
  };
}
