# Rebase PostgreSQL App Example

A complete example application demonstrating how to use Rebase with a PostgreSQL backend, featuring a unified monorepo structure with shared collections and optimal developer experience.

## 🏗️ Architecture

This application consists of three main parts:

- **`frontend/`** - React application using Rebase with PostgreSQL data source
- **`backend/`** - Node.js server with PostgreSQL/Drizzle ORM and WebSocket support
- **`shared/`** - Shared collections and types used by both frontend and backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm

### Installation

```bash
# Install all dependencies
pnpm install

# Or install individually
pnpm install
```

### Environment Setup

1. Copy `.env` and configure your database connection:
```bash
# Update the DATABASE_URL and other settings
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
```

### Development

Start both frontend and backend with a single command:

```bash
pnpm dev
```

This will:
- Start the backend server on `http://localhost:3001`
- Start the frontend development server
- Enable hot reloading for both applications
- Provide real-time WebSocket synchronization

### Individual Development Commands

```bash
# Backend only
pnpm dev:backend

# Frontend only  
pnpm dev:frontend

# Database operations
rebase schema generate # Generate schema from collections
rebase db push         # Push schema changes to development database
rebase db generate     # Generate SQL migrations (for production)
rebase db migrate      # Run database migrations (for production)
rebase db studio       # Open Drizzle Studio
```

## 📦 Production Deployment

### Build Everything

```bash
pnpm build
```

This builds:
1. Shared collections package
2. Frontend application (static files)
3. Backend application

### Deploy

```bash
pnpm deploy
```

Or start the production server:

```bash
pnpm start
```

The backend serves the frontend statically in production, so you only need to deploy one application.

## 🗂️ Project Structure

```
app/
├── package.json          # Root package with unified scripts
├── .env                  # Environment configuration
├── frontend/            # React Rebase application
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/            # PostgreSQL backend server
│   ├── src/
│   ├── package.json
│   └── drizzle.config.ts
└── shared/            # Shared collections and types
    ├── collections/
    ├── index.ts
    └── package.json
```

## 🔧 Features

- **Unified Development**: Single command to start both frontend and backend
- **Shared Collections**: No duplication between frontend and backend
- **Static Serving**: Backend serves frontend in production
- **Real-time Sync**: WebSocket-based real-time updates
- **Type Safety**: Full TypeScript support across all packages
- **Hot Reloading**: Fast development with instant updates

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend |
| `pnpm build` | Build all packages |
| `pnpm start` | Start production server |
| `pnpm deploy` | Build and deploy |
| `pnpm clean` | Clean all build artifacts |
| `rebase schema generate` | Generate DB schema |
| `rebase db push` | Push changes to development database |
| `rebase db generate` | Generate SQL migration files |
| `rebase db migrate` | Run database migrations |
| `rebase db studio` | Open database studio |

## 📊 Database

The application uses PostgreSQL with Drizzle ORM for:
- Type-safe database operations
- Automatic schema generation from Rebase collections
- Real-time synchronization via WebSockets
- Migration management

## 🔐 Authentication

Currently configured with Firebase Authentication, but can be easily adapted to other auth providers.

## 🎯 Development Tips

1. **Shared Collections**: Edit collections in `shared/collections/` - changes are immediately available to both frontend and backend
2. **Environment Variables**: All configuration is in the root `.env` file
3. **Hot Reloading**: Both frontend and backend support hot reloading during development
4. **Database Schema**: Run `rebase schema generate` and then `rebase db push` after changing collections

## 📝 License

MIT
