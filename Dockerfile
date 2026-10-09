# --- ESTADIO 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Instalar dependencias permitiendo scripts no interactivos
RUN pnpm install --frozen-lockfile --config.ignore-scripts=true

COPY . .
RUN pnpm run build

# --- ESTADIO 2: PRODUCCIÓN ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile --config.ignore-scripts=true

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
