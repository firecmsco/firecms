# @firecms/backend

PostgreSQL and Drizzle ORM backend implementation for FireCMS.

This package provides a complete backend solution for FireCMS applications using PostgreSQL as the database and Drizzle ORM for type-safe database operations.

## Installation

```bash
npm install @firecms/backend @firecms/core
```

## Usage

```typescript
import { createBackend } from "@firecms/backend";

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
- Full FireCMS compatibility
- Migration support
- Connection pooling

## Development

This package is part of the FireCMS monorepo. For development instructions, see the main repository README.

## License

MIT
