# NestJS Authentication Implementation

## Overview

This project implements a JWT-based authentication system with support for both JSON body login and HTTP Basic Authentication, demonstrating Base64 encoding as discussed in the lecture.

## Features

- **Dual Authentication Methods**:
  - JSON body with email and password
  - HTTP Basic Authentication with Base64-encoded credentials
- **JWT Token Pair**: Short-lived access token (15 minutes) and long-lived refresh token (7 days)
- **Password Hashing**: Uses bcrypt for secure password storage
- **Input Validation**: DTO validation with class-validator
- **Prisma ORM**: Database operations with PostgreSQL

## API Endpoint

### POST /auth/login

Accepts authentication in two formats:

#### 1. JSON Body Format

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  http://localhost:3000/auth/login
```

#### 2. Basic Authentication Header

```bash
curl -X POST \
  -H "Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==" \
  http://localhost:3000/auth/login
```

**Base64 Encoding Example**:

- Original: `test@example.com:password123`
- Base64: `dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==`

### Response Format

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

## Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── login.dto.ts           # Login validation DTO
│   ├── interfaces/
│   │   └── auth.interfaces.ts     # JWT and response type definitions
│   ├── auth.controller.ts         # Authentication endpoint
│   ├── auth.service.ts            # Authentication business logic
│   └── auth.module.ts             # Auth module configuration
├── user/
│   ├── user.service.ts            # User database operations
│   ├── user.controller.ts         # User endpoints (future use)
│   └── user.module.ts             # User module configuration
├── common/
│   └── prisma.service.ts          # Prisma database service
└── main.ts                        # Application bootstrap
```

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Create/update `.env` file:

```env
DATABASE_URL=postgres://demo:demo@localhost:5433/nestjs_db
NODE_ENV=development
PORT=3000
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed test data
pnpm run db:seed
```

### 4. Start Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod
```

## Testing

### Automated Test Script

```bash
./test-auth.sh
```

### Manual Testing

1. **Valid JSON Login**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  http://localhost:3000/auth/login
```

2. **Valid Basic Auth Login**:

```bash
curl -X POST \
  -H "Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==" \
  http://localhost:3000/auth/login
```

3. **Invalid Credentials**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}' \
  http://localhost:3000/auth/login
```

## Token Information

- **Access Token**: 15-minute expiration, used for API authentication
- **Refresh Token**: 7-day expiration, used for obtaining new access tokens
- **JWT Secrets**: Configurable via environment variables

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Signing**: Separate secrets for access and refresh tokens
- **Input Validation**: Email format and password length validation
- **Error Handling**: Proper error responses for invalid credentials

## Development Notes

The implementation demonstrates:

- **Base64 Encoding**: HTTP Basic Auth uses Base64 encoding of `email:password`
- **Dual Authentication**: Controller accepts either JSON body or Authorization header
- **JWT Best Practices**: Short access tokens with longer refresh tokens
- **Modular Architecture**: Separate modules for auth and user management

## Test User

Default test user created by seed script:

- **Email**: test@example.com
- **Password**: password123
- **Name**: Test User
