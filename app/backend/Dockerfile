FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages and app definition
COPY packages ./packages
COPY app ./app

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Start the app
WORKDIR /app/app/backend
EXPOSE 3001
CMD ["node", "dist/src/index.js"]
