# {{PROJECT_NAME}}

A [Rebase](https://rebase.pro) project with a PostgreSQL backend.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io)
- A PostgreSQL database

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure your database — edit `.env` and set `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb
```

3. Generate the schema and push to database:

```bash
rebase schema generate
rebase db push
```

4. Start the dev server:

```bash
pnpm dev
```

This starts both the backend (Express + PostgreSQL on port 3001) and the frontend (Vite + React on port 5173) concurrently.

## Project Structure

```
├── frontend/       # React frontend (Vite)
├── backend/        # Express backend with PostgreSQL
├── shared/         # Shared collection definitions
├── .env            # Environment variables
└── package.json    # Root workspace config
```

### Shared Collections

Collections are defined once in `shared/collections/` and used by both the frontend and backend. This ensures your schema stays in sync across the stack.

## Documentation

- [Rebase Docs](https://rebase.pro/docs)
- [GitHub](https://github.com/rebasepro/rebase)
