# NestJS Test Application

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

### 3. Generate Environment Configuration

Copy the environment example file and configure your environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file if needed to match your setup:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Application port (default: 3000)

### 4. Create Prisma Migration

Generate and apply database migrations:

```bash
pnpm prisma migrate dev
```

This command will:

- Generate a new migration based on your Prisma schema
- Apply the migration to your database
- Generate the Prisma client

### 5. Run Tests

Execute the test suite:

```bash
pnpm run test
```

## Test Commands

## Run All Tests

```bash
pnpm run test
```

## Run Individual Unit Tests

### App Controller Tests

```bash
pnpm run test -- src/app.controller.spec.ts
```

### Profiles Service Tests

```bash
pnpm run test -- src/profiles/profiles.service.spec.ts
```

### Profiles Controller Tests

```bash
pnpm run test -- src/profiles/profiles.controller.spec.ts
```

### Auth Guard Tests

```bash
pnpm run test -- src/auth/auth.guard.spec.ts
```

## Run Individual E2E Tests

### App E2E Tests

```bash
pnpm run test:e2e -- test/app.e2e-spec.ts
```

### Profiles E2E Tests

```bash
pnpm run test:e2e -- test/profiles.e2e-spec.ts
```

## Additional Test Commands

### Run All Tests with Coverage

```bash
pnpm run test:cov
```

### Run Tests in Watch Mode

```bash
pnpm run test:watch
```

### Run All E2E Tests

```bash
pnpm run test:e2e
```
