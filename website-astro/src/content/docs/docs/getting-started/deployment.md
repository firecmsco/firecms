---
title: Deployment
sidebar_label: Deployment
slug: docs/getting-started/deployment
description: Deploy your Rebase project to production using Docker, cloud platforms, or manual setups.
---

## Docker Compose (Recommended)

The generated project includes a `Dockerfile` and `docker-compose.yml`. This is the simplest way to deploy:

```yaml title="docker-compose.yml"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rebase
      POSTGRES_PASSWORD: rebase
      POSTGRES_DB: rebase
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://rebase:rebase@postgres:5432/rebase
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - uploads:/app/uploads

volumes:
  pgdata:
  uploads:
```

```bash
docker compose up -d
```

## Production Checklist

Before deploying to production, ensure:

| Item | Details |
|------|---------|
| **JWT_SECRET** | Use a cryptographically strong random string (≥ 32 chars). Never reuse across environments. |
| **DATABASE_URL** | Use a managed Postgres instance (Neon, Supabase, RDS) with TLS enabled |
| **CORS** | Configure allowed origins on your backend if frontend and backend are on different domains |
| **Storage volumes** | Mount persistent volumes for file uploads. Or switch to S3 for production. |
| **HTTPS** | Terminate TLS at your reverse proxy (nginx, Cloudflare, load balancer) |
| **Registration** | Set `ALLOW_REGISTRATION=false` after creating your admin account |

## Serving the Frontend

In production, the backend can serve the frontend as a static SPA:

```typescript
import { serveSPA } from "@rebasepro/backend";

// After initializeRebaseBackend()
serveSPA(app, "./frontend/dist");
```

Build the frontend first:

```bash
cd frontend && pnpm build
```

This way you only need to deploy one server that handles both SPA and API.

## Cloud Platforms

### Railway / Render / Fly.io

1. Push your code to a Git repository
2. Connect the repo to your cloud platform
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.)
4. The included `Dockerfile` will be auto-detected

### Google Cloud Run

```bash
# Build the container
docker build -t gcr.io/YOUR_PROJECT/rebase-backend ./backend

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT/rebase-backend

# Deploy
gcloud run deploy rebase-backend \
  --image gcr.io/YOUR_PROJECT/rebase-backend \
  --set-env-vars DATABASE_URL=...,JWT_SECRET=... \
  --allow-unauthenticated
```

:::caution
Cloud Run instances are stateless. Use **S3 storage** instead of local filesystem for file uploads, and enable **cross-instance realtime** by providing a `connectionString` in your driver config so WebSocket updates propagate across replicas.
:::

## Changing the Base URL

If you want Rebase to run at a sub-path (e.g., `/admin`):

**Frontend** — Update the `BrowserRouter` basename:

```tsx title="frontend/src/main.tsx"
<BrowserRouter basename="/admin">
    <App />
</BrowserRouter>
```

**Backend** — Update the base path:

```typescript
await initializeRebaseBackend({
    // ...
    basePath: "/admin/api"
});
```

## Next Steps

- **[Backend Overview](/docs/backend)** — Full backend configuration
- **[Storage Configuration](/docs/storage/configuration)** — S3 setup for production
