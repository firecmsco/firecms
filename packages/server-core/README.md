# @rebasepro/backend

PostgreSQL and Drizzle ORM backend implementation for Rebase.

This package provides a complete backend solution for Rebase applications using PostgreSQL as the database and Drizzle ORM for type-safe database operations.

## Installation

```bash
npm install @rebasepro/backend @rebasepro/core
```

## Usage

```typescript
import { createBackend } from "@rebasepro/backend";

const backend = createBackend({
  connectionString: "postgresql://user:password@localhost:5432/database",
  schema: "public",
  debug: true
});
```

## Features

- PostgreSQL database support
- Drizzle ORM integration
- Type-safe database operations
- Full Rebase compatibility
- Migration support
- Connection pooling

## Development

This package is part of the Rebase monorepo. For development instructions, see the main repository README.

## License

MIT
