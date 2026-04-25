FROM oven/bun:1-alpine AS base

WORKDIR /app

# Install dependencies needed for node-gyp and prisma
RUN apk add --no-cache python3 make g++ openssl

# Copy package.json and bun.lock
COPY package.json bun.lock* ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/cron/package.json ./services/cron/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Expose Next.js port
EXPOSE 3000

CMD ["bun", "run", "start:web"]
