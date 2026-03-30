---
name: rebase-deployment
description: Guide for deploying Rebase applications. Use this skill when the user needs to deploy to Rebase Cloud, set up Docker, configure Firebase Hosting, or self-host Rebase.
---

# Rebase Deployment

Rebase supports multiple deployment strategies — from fully managed Rebase Cloud to self-hosted Docker deployments.

## Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| **Rebase Cloud** | Fastest setup, managed infrastructure | ⭐ Easy |
| **Docker** | Full control, self-hosted | ⭐⭐ Medium |
| **Firebase Hosting** | Static frontend + Cloud Functions backend | ⭐⭐ Medium |
| **Custom** | Any Node.js hosting (Railway, Render, Fly.io, etc.) | ⭐⭐⭐ Advanced |

## Rebase Cloud

The simplest deployment path. Sign up at [app.rebase.pro](https://app.rebase.pro).

```bash
# 1. Authenticate
rebase login

# 2. Initialize (if new project)
rebase init

# 3. Deploy
rebase deploy

# Deploy to dev environment
rebase deploy --env dev
```

## Docker (Self-Hosted)

Rebase is designed to be Docker-ready:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

# Generate schema and run migrations
RUN pnpm run generate:schema
CMD ["pnpm", "run", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  rebase:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/rebase
      - JWT_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=rebase
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Firebase Hosting (Frontend)

Deploy the Studio frontend to Firebase Hosting:

```bash
# Build the frontend
cd app/frontend
pnpm run build

# Deploy to Firebase
npx firebase-tools@latest deploy --only hosting
```

## ⛔ Agent Deployment Rules

**Agents should NEVER deploy to production.** This includes:
- `firebase deploy` (any variant)
- `rebase deploy` (any variant)
- `gcloud functions deploy`
- Any command targeting production environments

**What agents CAN do:**
- Edit source code
- Run builds (`pnpm run build`)
- Run tests (`pnpm test`)
- Run local emulators
- Check logs (read-only)
- Provide the exact deployment commands for the user to run

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | ✅ Yes (self-hosted) |
| `S3_BUCKET` | S3 storage bucket | ❌ Optional |
| `S3_REGION` | S3 region | ❌ Optional |
| `S3_ACCESS_KEY` | S3 access key | ❌ Optional |
| `S3_SECRET_KEY` | S3 secret key | ❌ Optional |
| `FIREBASE_PROJECT_ID` | Firebase project ID (for Firebase Auth) | ❌ Optional |

## References

- **Docker Guide:** See [references/docker-setup.md](references/docker-setup.md) for complete Docker configuration.
- **Firebase Hosting:** See [references/firebase-hosting.md](references/firebase-hosting.md) for deploying the frontend.
- **Environment Config:** See [references/environment-config.md](references/environment-config.md) for all environment variables.
