################# 1. deps (npm + pnpm) #################################
FROM node:20-alpine AS deps
WORKDIR /workspace
RUN corepack enable

# копіюємо lock-файли
COPY backend/package*.json          backend/
COPY frontend/package.json \
     frontend/package-lock.json        frontend/

# ⬅️ frontend – БЕЗ --prod (потрібен vite)
RUN --mount=type=cache,target=/root/.npm  \
    npm  --prefix backend  ci --omit=dev && \
    npm --prefix frontend install --frozen-lockfile

################# 2. frontend build (vite) #############################
FROM node:20-alpine AS frontend
RUN corepack enable
WORKDIR /workspace/frontend

COPY --from=deps /workspace/frontend/node_modules ./node_modules
COPY frontend/ .
RUN npm run build             # vite → dist/

################# 3. backend prune (залишаємо prod-deps) ##############
FROM node:20-alpine AS backend
WORKDIR /workspace/backend

COPY --from=deps /workspace/backend/node_modules ./node_modules
COPY backend/ .
RUN npm prune --omit=dev        # тільки тут випиляємо dev-deps

################# 4. runtime (tiny) ###################################
FROM alpine:3.19
RUN apk add --no-cache nodejs tini
WORKDIR /app

COPY --from=backend   /workspace/backend            ./
COPY --from=frontend  /workspace/frontend/dist      ./build

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/server.js"]