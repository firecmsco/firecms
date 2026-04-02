# Rebase SDK Demo

A sample React + Vite app demonstrating the `@rebasepro/client` SDK.

## Features

- **Authentication** — Login / Register using the SDK's auth client
- **Collection Browsing** — Navigate Authors, Posts, Tags, Profiles
- **CRUD Operations** — Create, edit, delete records via the SDK
- **Pagination** — Server-side pagination with page navigation
- **Dark Theme** — Premium dark UI design

## Prerequisites

Start the backend from the `app/` folder first:

```bash
# From the repo root
cd app
pnpm install
pnpm run dev:backend
```

The backend must be running on `http://localhost:3001` (default).

## Running

```bash
cd examples/sdk-demo
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Default Credentials

The demo pre-fills `admin@demo.com` / `admin123`. These must exist in your backend's auth database.

## How It Works

```
┌─────────────┐     HTTP/WS     ┌──────────────┐
│  React App  │ ◄──────────────►│   Backend    │
│  (Vite)     │                 │  (Port 3001) │
│             │  @rebasepro/    │              │
│  hooks.ts   │  client SDK     │  REST: /api  │
│  App.tsx    │                 │  WS: :3001   │
└─────────────┘                 └──────────────┘
```

### Key Files

| File | Description |
|------|-------------|
| `src/client.ts` | SDK initialization with `createRebaseClient()` |
| `src/hooks.ts` | `useAuth()` and `useCollection()` React hooks |
| `src/App.tsx` | Full UI with auth, sidebar, table, CRUD dialogs |
