# NestJS Authentication App

A NestJS application with JWT authentication, role-based access control, and Prisma ORM.

## Quick Start

### 1. Start Docker Database

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Prisma Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with test users
npm run db:seed
```

### 4. Start the Application

```bash
# Development mode with hot reload
npm run start:dev

# Or production mode
npm run start:prod
```

The app will be available at `http://localhost:3000`

## Test API Endpoints

#### Login (JSON Body)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

#### Login (Basic Auth)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw=="
```

#### Access Protected Admin Endpoint

```bash
# First login as admin to get token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | jq -r '.accessToken')

# Then access admin endpoint
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/admin/metrics
```

## Default Users (from seed)

- **Regular User**: `test@example.com` / `password123`
- **Admin User**: `admin@example.com` / `admin123`

## Database

- PostgreSQL running on port `5433`
- Database: `nestjs_db`
- User: `demo` / Password: `demo`
