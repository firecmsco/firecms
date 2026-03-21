---
slug: docs/self/deployment
title: Self-Hosted Deployment
sidebar_label: Deployment
description: Deploy your self-hosted Rebase CMS to any platform. Build the frontend as a static application and deploy to Vercel, Netlify, or any static hosting provider.
---

Rebase consists of a **frontend** (React SPA) and a **backend** (Node.js + PostgreSQL). The deployment strategy depends on how you want to host each part.

## Building the frontend

The frontend builds as a **single page application** (SPA) that can be deployed to any static hosting provider:

```bash
pnpm build
```

This generates a `dist` folder with the compiled frontend assets.

## Full-stack deployment

For a complete deployment, you need to host both:

1. **The backend** — A Node.js server connected to PostgreSQL
2. **The frontend** — The static SPA that connects to the backend

### Docker deployment (recommended)

The simplest approach is to use Docker. Your project includes a `Dockerfile` that builds both frontend and backend:

```bash
docker build -t rebase-app .
docker run -p 3001:3001 -e DATABASE_URL=postgresql://user:pass@host:5432/db rebase-app
```

### Deploying to a VPS or cloud provider

1. **Set up PostgreSQL** on a managed service (Supabase, Neon, Railway, AWS RDS, etc.)
2. **Deploy the backend** to a Node.js hosting service (Railway, Fly.io, DigitalOcean App Platform, etc.)
3. **Deploy the frontend** to a static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.)

Make sure to set the `DATABASE_URL` environment variable on your backend and configure the frontend to point to your backend URL.

## Deploying the frontend to Vercel

1. Build the frontend: `pnpm build`
2. Deploy the `dist` folder to Vercel
3. Configure SPA rewrites in `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Deploying the frontend to Netlify

1. Build the frontend: `pnpm build`
2. Deploy the `dist` folder to Netlify
3. Add a `_redirects` file to the `public` folder:

```
/*    /index.html   200
```

## Deploying to other platforms

Any static hosting provider that supports SPA rewrites will work. Build the frontend with `pnpm build` and serve the `dist` folder. Make sure all routes redirect to `index.html` for client-side routing to work.
