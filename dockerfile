# ===== Этап 1: сборка =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# Заглушка — нужна только чтобы prisma.config.ts не падал при generate,
# реального подключения к базе на этом этапе не происходит
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

RUN npx prisma generate
RUN npm run build

# ===== Этап 2: продакшен =====
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev

# Та же заглушка нужна и тут, раз этот этап тоже вызывает prisma generate
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main"]