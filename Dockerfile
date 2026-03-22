FROM node:20-alpine AS base

# ── Install deps ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build ─────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (standalone)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/prod.db"
RUN npm run build

# ── Production ────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for Coolify healthcheck
RUN apk add --no-cache curl

# Copy Next.js standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files for runtime DB initialization
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy entrypoint script
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Create data directory (will be a volume mount point)
RUN mkdir -p /app/data

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/prod.db"

CMD ["./entrypoint.sh"]
