# ── Stage 1: base ────────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat

# ── Stage 2: dependencies ────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 3: build ───────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate + next build need DATABASE_URL at build time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build args for any NEXT_PUBLIC_ vars needed at build time
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

RUN npx prisma generate
RUN npm run build

# ── Stage 4: runner (production) ─────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the full app (build output + source needed for runtime)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# Production dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Prisma schema + migrations for runtime migrate commands
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Directorio para imágenes locales
RUN mkdir -p ./public/uploads && chown nextjs:nodejs ./public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
