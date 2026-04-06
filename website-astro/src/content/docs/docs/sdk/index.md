---
title: Client SDK
sidebar_label: Client SDK
slug: docs/sdk
description: Use the Rebase Client SDK to interact with your backend from any JavaScript application — data operations, auth, storage, and real-time subscriptions.
---

## Overview

The `@rebasepro/client` package provides a type-safe JavaScript SDK for interacting with your Rebase backend. It handles:

- **Data operations** — CRUD with filtering, sorting, and pagination
- **Real-time subscriptions** — WebSocket-based live updates
- **Authentication** — Token management, login, signup
- **Storage** — File upload and download

## Installation

```bash
npm install @rebasepro/client
```

## Setup

```typescript
import { createRebaseClient } from "@rebasepro/client";

const client = createRebaseClient({
    baseUrl: "http://localhost:3001",
    websocketUrl: "ws://localhost:3001"
});
```

The client automatically manages authentication tokens — once a user logs in, all subsequent requests include the JWT.

## Data Operations

### Fetch a Collection

```typescript
const products = await client.data.fetchCollection("products", {
    filter: { active: ["==", true] },
    orderBy: "created_at",
    order: "desc",
    limit: 25
});

// products is an array of Entity objects:
// { id: 1, values: { name: "Laptop", price: 999 }, path: "products" }
```

### Fetch a Single Entity

```typescript
const product = await client.data.fetchEntity("products", 42);
```

### Create an Entity

```typescript
const newProduct = await client.data.saveEntity("products", {
    name: "New Product",
    price: 29.99,
    active: true
});
```

### Update an Entity

```typescript
await client.data.saveEntity("products", {
    name: "Updated Name",
    price: 39.99
}, 42); // entity ID
```

### Delete an Entity

```typescript
await client.data.deleteEntity("products", 42);
```

### Search

```typescript
const results = await client.data.fetchCollection("products", {
    search: "laptop",
    limit: 10
});
```

## Real-time Subscriptions

Subscribe to collection changes via WebSocket:

```typescript
// Subscribe to all products
const unsubscribe = client.data.listenCollection(
    "products",
    {
        filter: { active: ["==", true] },
        limit: 50
    },
    (entities) => {
        console.log("Products updated:", entities);
    }
);

// Unsubscribe when done
unsubscribe();
```

Subscribe to a single entity:

```typescript
const unsubscribe = client.data.listenEntity(
    "products",
    42,
    (entity) => {
        console.log("Product changed:", entity);
    }
);
```

The WebSocket client handles reconnection automatically.

## Authentication

```typescript
// Login
const session = await client.auth.signIn("user@example.com", "password");

// Register
const session = await client.auth.signUp("user@example.com", "password");

// Google OAuth
const session = await client.auth.signInWithGoogle(googleIdToken);

// Refresh token
await client.auth.refreshToken();

// Logout
await client.auth.signOut();

// Get current user
const user = client.auth.getUser();
```

## Storage

```typescript
// Upload
const result = await client.storage.uploadFile(file, "products/image.jpg");

// Get URL
const url = await client.storage.getDownloadURL("products/image.jpg");

// Delete
await client.storage.deleteFile("products/image.jpg");
```

## Using with React

In a Rebase frontend, the client is typically created once and shared via context:

```tsx
const client = createRebaseClient({ baseUrl: API_URL, websocketUrl: WS_URL });

// Pass to Rebase provider
<Rebase client={client} ...>
```

Access it from any component:

```tsx
import { useRebaseClient } from "@rebasepro/core";

function MyComponent() {
    const client = useRebaseClient();
    // Use client.data, client.auth, client.storage
}
```

## SDK Generator

Generate a fully typed client SDK from your collection definitions:

```bash
rebase generate_sdk
```

This creates TypeScript types for all your entities, so you get autocomplete and type checking when using the client.

## Next Steps

- **[Frontend Overview](/docs/frontend)** — React framework and components
- **[Backend Overview](/docs/backend)** — Server configuration
