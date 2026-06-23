# Build stage
FROM node:22-slim AS builder
WORKDIR /app

# Copy root monorepo package files to install workspaces correctly
COPY package.json package-lock.json ./
COPY discord-bot/package.json ./discord-bot/package.json

# Install dependencies (both dev and prod dependencies needed for build)
RUN npm ci --workspace=discord-bot

# Copy package configuration and source files
COPY discord-bot/tsconfig.json ./discord-bot/
COPY discord-bot/src ./discord-bot/src

# Compile TypeScript to JavaScript
RUN npm run build --workspace=discord-bot

# Runner stage
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json for npm install
COPY discord-bot/package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from the builder stage
COPY --from=builder /app/discord-bot/dist ./dist

# Copy the documentation file into the compiled folder.
# This matches the local lookup path './llms.txt' from within dist/index.js
COPY website-astro/public/llms.txt ./dist/llms.txt

# Start the bot
CMD ["node", "dist/index.js"]
