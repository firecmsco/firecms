# @firecms/postgresql

PostgreSQL data source client for FireCMS with real-time WebSocket connectivity.

This package provides a complete client-side implementation for connecting FireCMS applications to PostgreSQL backends, featuring real-time synchronization via WebSockets.

## Installation

```bash
npm install @firecms/postgresql @firecms/core
```

## Usage

### Basic Setup with React Hook

```typescript
import { usePostgresDataSource } from "@firecms/postgresql";
import { FireCMS } from "@firecms/core";

function App() {
    const dataSource = usePostgresDataSource({
        baseUrl: "http://localhost:3001",
        websocketUrl: "ws://localhost:3001", // Optional, will be inferred from baseUrl
        headers: { // Optional
            "Authorization": "Bearer your-token"
        }
    });

    return (
        <FireCMS
            dataSource={dataSource}
            collections={collections}
            // ... other props
        />
    );
}
```

### Creating Data Source Directly

```typescript
import { createPostgresDataSource } from "@firecms/postgresql";

const dataSource = createPostgresDataSource({
    baseUrl: "http://localhost:3001",
    websocketUrl: "ws://localhost:3001"
});
```

## Features

- **Real-time Synchronization**: WebSocket-based real-time updates for collections and entities
- **Automatic Reconnection**: Built-in reconnection logic with exponential backoff
- **Type Safety**: Full TypeScript support with FireCMS core types
- **Error Handling**: Comprehensive error handling with custom error types
- **Connection Management**: Connection status monitoring and queue management

## API

### Configuration

```typescript
interface PostgresDataSourceConfig {
    baseUrl: string;           // Backend server URL
    websocketUrl?: string;     // WebSocket URL (optional)
    headers?: Record<string, string>; // Custom headers (optional)
}
```

### Methods

The PostgreSQL data source implements all FireCMS `DataSource` methods:

- `fetchCollection<M>(props): Promise<Entity<M>[]>`
- `fetchEntity<M>(props): Promise<Entity<M> | undefined>`
- `saveEntity<M>(props): Promise<Entity<M>>`
- `deleteEntity<M>(props): Promise<void>`
- `checkUniqueField(...): Promise<boolean>`
- `generateEntityId(...): string`
- `countEntities<M>(props): Promise<number>`
- `listenCollection<M>(props): () => void`
- `listenEntity<M>(props): () => void`

## Backend Requirements

This client expects a WebSocket-enabled backend that handles the following message types:

- `FETCH_COLLECTION`
- `FETCH_ENTITY`
- `SAVE_ENTITY`
- `DELETE_ENTITY`
- `CHECK_UNIQUE_FIELD`
- `GENERATE_ENTITY_ID`
- `COUNT_ENTITIES`
- `subscribe_collection`
- `subscribe_entity`
- `unsubscribe`

## Development

This package is part of the FireCMS monorepo. For development instructions, see the main repository README.

## License

MIT
