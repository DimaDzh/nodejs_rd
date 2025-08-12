# Multi-stage Dockerfile for NestJS Tea Tracker API

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig*.json ./

# Install all dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm ci --silent; \
    fi

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Install only production dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile --prod; \
    else \
      npm ci --only=production --silent; \
    fi

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
