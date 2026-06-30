# Build stage
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Copy root monorepo files needed for workspace install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY discord-bot/package.json ./discord-bot/package.json

# Install dependencies (both dev and prod dependencies needed for build)
RUN pnpm install --filter discord-bot --frozen-lockfile

# Copy package configuration and source files
COPY discord-bot/tsconfig.json ./discord-bot/
COPY discord-bot/src ./discord-bot/src

# Compile TypeScript to JavaScript
RUN pnpm --filter discord-bot run build

# Runner stage
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Copy package.json for pnpm install
COPY discord-bot/package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy compiled files from the builder stage
COPY --from=builder /app/discord-bot/dist ./dist

# Copy the documentation file into the compiled folder.
# This matches the local lookup path './llms.txt' from within dist/index.js
COPY website-astro/public/llms.txt ./dist/llms.txt

# Start the bot
CMD ["node", "dist/index.js"]
