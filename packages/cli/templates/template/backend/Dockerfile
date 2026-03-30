FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root configurations
COPY package.json ./

# Copy internal workspaces
COPY backend ./backend
COPY shared ./shared

# Install dependencies
RUN pnpm install

# Build shared and backend
RUN pnpm run build:shared
RUN pnpm run build:backend

WORKDIR /app/backend
EXPOSE 3001
CMD ["pnpm", "start"]
