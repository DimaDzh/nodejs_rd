# Demo Deploy

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials
```

## Database

```bash
# Generate migration after changing entities
npm run migration:generate AddNewFeature

# Run migrations
npm run migration:run

# Check schema consistency
npm run schema:check
```

## Development

```bash
# Start in development mode
pnpm run start:dev

# Build for production
pnpm run build
```

## Code Quality

Pre-commit hooks automatically run:

- **ESLint** - Code linting with auto-fix
- **Schema Check** - Database schema validation

```bash
# Manual linting
npm run lint

# Manual schema check
npm run schema:check
```

## Docker

```bash
# Start with Docker Compose
docker-compose up -d
```
