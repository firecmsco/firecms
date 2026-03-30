---
name: rebase-local-env-setup
description: Bare minimum INITIAL setup for getting started with Rebase (Node.js, pnpm, PostgreSQL, Docker). Use ONLY for first-time setup. For updating or troubleshooting an existing environment, use the rebase-basics skill instead.
---

# Rebase Local Environment Setup

This skill documents the bare minimum setup required for a full Rebase development experience. Before starting to use any Rebase features, you MUST verify that each of the following steps has been completed.

## 1. Verify Node.js

- **Action**: Run `node --version`.
- **Handling**: Ensure Node.js is installed and the version is `>= 20`. If Node.js is missing or `< v20`:

  **Recommended: Use a Node Version Manager**

  **For macOS or Linux:**
  1. Guide the user to the [official nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating).
  2. Request the user to manually install `nvm` and reply when finished. **Stop and wait** for the user's confirmation.
  3. Make `nvm` available in the current terminal session:
     ```bash
     source ~/.zshrc   # For Zsh
     source ~/.bashrc  # For Bash
     ```
  4. Install Node.js:
     ```bash
     nvm install 20
     nvm use 20
     ```

  **For Windows:**
  1. Guide the user to download and install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases).
  2. Request the user to manually install and reply when finished.

## 2. Verify pnpm

Rebase uses pnpm exclusively as its package manager. Never use npm or yarn.

- **Action**: Run `pnpm --version`.
- **Handling**: If pnpm is not installed:
  ```bash
  npm install -g pnpm
  ```
- **Verify**: Run `pnpm --version` again to confirm.

## 3. Verify PostgreSQL

Rebase's backend requires a PostgreSQL database (v14+).

### Option A: Docker (Recommended)

```bash
# Check if Docker is running
docker info

# Start a PostgreSQL container
docker run --name rebase-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rebase \
  -p 5432:5432 \
  -d postgres:16
```

### Option B: Local Installation

- **macOS**: `brew install postgresql@16 && brew services start postgresql@16`
- **Linux**: `sudo apt-get install postgresql-16`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

### Verify Connection

```bash
psql -h localhost -U postgres -d rebase -c "SELECT 1;"
```

## 4. Configure Environment Variables

Create an `.env` file in the `app/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rebase
```

## 5. Install Dependencies

From the repo root:

```bash
pnpm install
```

## 6. Initialize the Database

```bash
cd app
pnpm run generate:schema
cd backend && pnpm run db:push
```

## 7. Start the Development Server

```bash
cd app
pnpm run dev
```

This starts both the frontend (Vite) and backend (Express) servers.
