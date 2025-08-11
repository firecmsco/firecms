# FireCMS PostgreSQL App Example

A complete example application demonstrating how to use FireCMS with a PostgreSQL backend, featuring a unified monorepo structure with shared collections and optimal developer experience.

## 🏗️ Architecture

This application consists of three main parts:

- **`frontend/`** - React application using FireCMS with PostgreSQL data source
- **`backend/`** - Node.js server with PostgreSQL/Drizzle ORM and WebSocket support
- **`shared/`** - Shared collections and types used by both frontend and backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install
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
npm run dev
```

This will:
- Start the backend server on `http://localhost:3001`
- Start the frontend development server
- Enable hot reloading for both applications
- Provide real-time WebSocket synchronization

### Individual Development Commands

```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend

# Database operations
npm run db:migrate     # Run database migrations
npm run db:studio     # Open Drizzle Studio
npm run generate:schema # Generate schema from collections
```

## 📦 Production Deployment

### Build Everything

```bash
npm run build
```

This builds:
1. Shared collections package
2. Frontend application (static files)
3. Backend application

### Deploy

```bash
npm run deploy
```

Or start the production server:

```bash
npm start
```

The backend serves the frontend statically in production, so you only need to deploy one application.

## 🗂️ Project Structure

```
app/
├── package.json          # Root package with unified scripts
├── .env                  # Environment configuration
├── frontend/            # React FireCMS application
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
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build all packages |
| `npm run start` | Start production server |
| `npm run deploy` | Build and deploy |
| `npm run clean` | Clean all build artifacts |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open database studio |

## 📊 Database

The application uses PostgreSQL with Drizzle ORM for:
- Type-safe database operations
- Automatic schema generation from FireCMS collections
- Real-time synchronization via WebSockets
- Migration management

## 🔐 Authentication

Currently configured with Firebase Authentication, but can be easily adapted to other auth providers.

## 🎯 Development Tips

1. **Shared Collections**: Edit collections in `shared/collections/` - changes are immediately available to both frontend and backend
2. **Environment Variables**: All configuration is in the root `.env` file
3. **Hot Reloading**: Both frontend and backend support hot reloading during development
4. **Database Schema**: Run `npm run generate:schema` after changing collections

## 📝 License

MIT
