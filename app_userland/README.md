# Rebase Userland App — Firebase Data Connect

A userland simulation of the Rebase application, connected to the **Firebase Data Connect** Cloud SQL PostgreSQL instance on project `rebase-578f2`.

## 🏗️ Architecture

This is a copy of the main `app/` folder, configured to connect to the Cloud SQL instance provisioned by Firebase Data Connect instead of a self-managed PostgreSQL database.

- **`frontend/`** - React application using Rebase with PostgreSQL data source (port 5174)
- **`backend/`** - Node.js server with PostgreSQL/Drizzle ORM and WebSocket support (port 3002)
- **`shared/`** - Shared collections and types used by both frontend and backend

## 🔌 Database Connection

The Cloud SQL instance details:
- **Project**: `rebase-578f2`
- **Instance**: `rebase-578f2-instance`
- **Region**: `europe-west3`
- **Database**: `rebase-578f2-database`
- **Public IP**: `34.159.171.8`

## 🚀 Setup

### 1. Set PostgreSQL password

```bash
gcloud sql users set-password postgres \
  --instance=rebase-578f2-instance \
  --project=rebase-578f2 \
  --password=YOUR_SECURE_PASSWORD
```

### 2. Connect via Cloud SQL Auth Proxy (recommended)

Install the proxy:
```bash
# macOS
brew install cloud-sql-proxy

# Or download directly
# https://cloud.google.com/sql/docs/postgres/connect-auth-proxy
```

Start the proxy:
```bash
pnpm proxy
# Or manually:
cloud-sql-proxy rebase-578f2:europe-west3:rebase-578f2-instance
```

This tunnels `127.0.0.1:5432` → Cloud SQL. The `.env` is pre-configured for this.

### 3. Update `.env`

Edit `.env` and replace `CHANGE_ME` with your PostgreSQL password:
```
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD@127.0.0.1:5432/fdcdb
```

### Alternative: Direct IP connection

If you prefer direct IP access, authorize your network:
```bash
gcloud sql instances patch rebase-578f2-instance \
  --project=rebase-578f2 \
  --authorized-networks=YOUR_IP/32
```

Then update `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@34.159.171.8:5432/fdcdb
```

### 4. Install & Run

```bash
# From the monorepo root
pnpm install

# Initialize the database schema
cd app_userland
pnpm db:push    # Push schema directly (no migration files)
# or
pnpm db:migrate # Apply existing migrations

# Start development
pnpm dev
```

This will start:
- Backend on `http://localhost:3002`
- Frontend on `http://localhost:5174`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend |
| `pnpm dev:frontend` | Start only the frontend (port 5174) |
| `pnpm dev:backend` | Start only the backend (port 3002) |
| `pnpm build` | Build all packages |
| `pnpm start` | Start production server |
| `pnpm proxy` | Start Cloud SQL Auth Proxy |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:pull` | Pull schema from database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm generate:schema` | Regenerate Drizzle schema from collections |

## 🔑 Key Differences from `app/`

| Aspect | `app/` | `app_userland/` |
|--------|--------|-----------------|
| Database | Self-managed Postgres (34.22.208.81) | Firebase Data Connect Cloud SQL |
| Backend Port | 3001 | 3002 |
| Frontend Port | 5173 | 5174 |
| DB Name | `firecms` | `rebase-578f2-database` |
| Package names | `rebase-app-*` | `rebase-userland-*` |

Both can run simultaneously without conflicts.

## 📝 License

MIT
