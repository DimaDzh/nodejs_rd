# Test Commands

## Setup (Required Before Running Tests)

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Apply Database Migrations

```bash
pnpm prisma migrate deploy
```

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

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
