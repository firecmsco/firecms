FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root configurations
COPY package.json ./

# Copy internal workspaces
COPY frontend ./frontend
COPY shared ./shared

# Install dependencies
RUN pnpm install

# Build shared and frontend
RUN pnpm run build:shared
RUN pnpm run build:frontend

# Install a simple static server
RUN npm install -g serve

WORKDIR /app/frontend
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
