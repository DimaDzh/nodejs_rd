# builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

# runtime
FROM alpine:3.19
RUN apk add --no-cache nodejs tini
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY dist ./build

COPY package.json ./
USER 1000
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/server.js"]
EXPOSE 3000