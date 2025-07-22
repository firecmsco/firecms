# FireCMS Custom Backend

A PostgreSQL-based backend for FireCMS with real-time sync capabilities using Docker, Node.js, and Drizzle ORM.

## Features

- 🐘 PostgreSQL database with JSONB document storage
- 🔄 Real-time synchronization via WebSockets
- 🐳 Docker containerization for easy deployment
- 🛠️ TypeScript with Drizzle ORM
- 📡 REST API compatible with FireCMS DataSourceDelegate interface
- 🔍 Full-text search capabilities
- 📊 Performance optimized with proper indexing

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. **Start the services:**
   ```bash
   npm run docker:up
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Stop services:**
   ```bash
   npm run docker:down
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL (using Docker):**
   ```bash
   docker-compose up postgres -d
   ```

3. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### REST API

- `POST /api/collections/fetch` - Fetch entities from a collection
- `POST /api/entities/fetch` - Fetch a single entity
- `POST /api/entities/save` - Save/update an entity
- `DELETE /api/entities/delete` - Delete an entity
- `POST /api/entities/check-unique` - Check field uniqueness
- `POST /api/entities/generate-id` - Generate new entity ID
- `POST /api/collections/count` - Count entities in collection

### WebSocket API

Connect to `ws://localhost:3001` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Subscribe to collection updates
ws.send(JSON.stringify({
  type: 'subscribe_collection',
  payload: {
    path: 'users',
    subscriptionId: 'sub_123'
  }
}));

// Subscribe to entity updates
ws.send(JSON.stringify({
  type: 'subscribe_entity',
  payload: {
    path: 'users',
    entityId: 'user_123',
    subscriptionId: 'sub_124'
  }
}));
```

## Database Schema

The backend uses a document-like approach with PostgreSQL's JSONB:

- **entities** - Stores all FireCMS entities with JSONB values
- **collections** - Metadata about collections and schemas
- **subscriptions** - Tracks real-time WebSocket subscriptions

## Integration with FireCMS

Replace your Firebase delegate with the custom PostgreSQL delegate:

```typescript
import { PostgresDataSourceDelegate } from './custom-backend/client';

// In your FireCMS configuration
const dataSource = new PostgresDataSourceDelegate({
  baseUrl: 'http://localhost:3001',
  websocketUrl: 'ws://localhost:3001'
});
```

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate new migrations
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio for database inspection

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL=postgresql://firecms:firecms_password@localhost:5432/firecms
PORT=3001
NODE_ENV=development
```

## Performance Optimization

The backend includes several optimizations:

- JSONB GIN indexes for fast queries
- Composite indexes on path and database_id
- Automatic updated_at timestamp triggers
- Connection pooling with node-postgres

## Real-time Sync

Real-time synchronization works by:

1. WebSocket connections for live updates
2. Subscription tracking in PostgreSQL
3. Change notifications after entity mutations
4. Efficient delta updates to minimize bandwidth

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use environment variables for database credentials
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Consider using a managed PostgreSQL service

## Troubleshooting

### Common Issues

1. **Connection errors**: Check if PostgreSQL is running and accessible
2. **Migration errors**: Ensure database exists and has proper permissions
3. **WebSocket issues**: Verify firewall settings and port availability

### Logs

View detailed logs:
```bash
# Docker logs
docker-compose logs -f backend

# Application logs
npm run docker:logs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the same license as FireCMS.
