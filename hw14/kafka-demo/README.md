# Kafka Demo

## Setup

### Run Kafka with Docker Compose

```bash
docker-compose up -d
```

### Install & Run

```bash
pnpm install
pnpm dev
```

### Test

- `POST /signup` triggers a UserSignedUp event → Kafka → log in console
- Console logs the received event with user details
- Swagger UI available at: http://localhost:3000/docs

### Example Test Request

```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "testuser"}'
```
