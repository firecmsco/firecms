---
slug: docs/pro/sdk_generator
title: JavaScript SDK Generator
description: Generate a type-safe JavaScript SDK from your Rebase collection definitions. Get auto-complete, typed CRUD methods, and PostgREST-style filtering — all from a single CLI command.
---

Generate a **type-safe JavaScript SDK** directly from your collection definitions. The SDK gives you auto-completed, collection-namespaced CRUD methods — similar to the Supabase and Payload client libraries — without writing any boilerplate.

:::tip Why use the SDK generator?
- **Zero boilerplate** — One CLI command produces a fully typed client
- **IDE auto-complete** — JSDoc typedefs generated from your collection properties
- **Consistent with your schema** — Re-run the generator whenever your collections change
- **Framework-agnostic** — Plain JavaScript with no runtime dependencies
:::

## Quick start

### 1. Install the CLI

```bash
npm install -g @rebasepro/cli
```

### 2. Generate the SDK

Point the generator at your collection definitions:

```bash
rebase generate-sdk --collections ./src/collections --output ./src/generated/sdk
```

This scans every exported `EntityCollection` in the given directory and produces a ready-to-use SDK in the output folder.

### 3. Use the SDK

```js
import { createRebaseClient } from './generated/sdk/index.js';

const rebase = createRebaseClient({
    baseUrl: 'http://localhost:3001',
    token: 'your-jwt-token',
});

// List records with filtering
const { data, meta } = await rebase.posts.find({
    limit: 10,
    where: { status: 'eq.published' },
    orderBy: 'created_at:desc',
});

// Get a single record
const post = await rebase.posts.findById(1);

// Create
const newPost = await rebase.posts.create({
    title: 'Hello World',
    content: 'My first post',
});

// Update
await rebase.posts.update(1, { title: 'Updated Title' });

// Delete
await rebase.posts.delete(1);
```

## CLI options

| Option | Default | Description |
|---|---|---|
| `--collections` | `./collections` | Path to the directory containing your `EntityCollection` exports |
| `--output` | `./generated/sdk` | Output directory for the generated SDK files |
| `--no-readme` | — | Skip generating the `README.md` usage guide |

### Example with all options

```bash
rebase generate-sdk \
    --collections ./app/shared/collections \
    --output ./app/frontend/src/sdk \
    --no-readme
```

## Generated files

The generator produces the following files:

| File | Purpose |
|---|---|
| `client.js` | HTTP transport, `createTransport`, `buildQueryString`, `RebaseApiError` |
| `{collection}.js` | Per-collection module with typed factory function and JSDoc typedefs |
| `index.js` | Unified `createRebaseClient` factory that wires all collections |
| `README.md` | Auto-generated usage guide (optional) |

## CRUD API reference

Every collection namespace exposes the same five methods:

### `find(params?)`

List records with optional filtering, pagination, and sorting.

```js
const result = await rebase.posts.find({
    limit: 20,
    page: 2,
    where: { status: 'eq.published', author_id: 'eq.5' },
    orderBy: 'created_at:desc',
    include: ['author', 'tags'],
});
// result.data   → array of records
// result.meta   → { total, limit, offset, hasMore }
```

**Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | `number` | Max records to return (default: 20) |
| `offset` | `number` | Records to skip |
| `page` | `number` | Page number (1-indexed, alternative to offset) |
| `where` | `Record<string, string>` | PostgREST-style filters (see below) |
| `orderBy` | `string` | Sort field and direction, e.g. `"created_at:desc"` |
| `include` | `string[]` | Relations to include in the response |

### `findById(id)`

Fetch a single record by primary key.

```js
const post = await rebase.posts.findById(42);
```

### `create(data)`

Insert a new record.

```js
const newPost = await rebase.posts.create({
    title: 'New Post',
    content: 'Content here...',
    status: 'draft',
});
```

### `update(id, data)`

Update an existing record. Only the provided fields are changed.

```js
const updated = await rebase.posts.update(42, {
    title: 'Updated Title',
});
```

### `delete(id)`

Delete a record by primary key.

```js
await rebase.posts.delete(42);
```

## Filtering with `where`

The `where` parameter uses **PostgREST-style operators** for type-safe filtering:

| Operator | Meaning | Example |
|---|---|---|
| `eq` | Equals | `{ status: 'eq.published' }` |
| `neq` | Not equals | `{ status: 'neq.draft' }` |
| `gt` | Greater than | `{ age: 'gt.18' }` |
| `gte` | Greater or equal | `{ age: 'gte.18' }` |
| `lt` | Less than | `{ price: 'lt.100' }` |
| `lte` | Less or equal | `{ price: 'lte.100' }` |
| `in` | In list | `{ role: 'in.(admin,editor)' }` |
| `nin` | Not in list | `{ role: 'nin.(banned)' }` |
| `cs` | Array contains | `{ tags: 'cs.news' }` |
| `csa` | Array contains any | `{ tags: 'csa.(news,tech)' }` |

Combine multiple filters by adding more keys to the `where` object:

```js
const result = await rebase.products.find({
    where: {
        category: 'eq.electronics',
        price: 'lte.999',
        in_stock: 'eq.true',
    },
});
```

## Authentication

### Setting a token at initialization

```js
const rebase = createRebaseClient({
    baseUrl: 'https://api.example.com',
    token: 'eyJhbGciOiJIUzI1NiIs...',
});
```

### Refreshing the token at runtime

```js
// After a token refresh
rebase.setToken('new-jwt-token');
```

### Custom fetch implementation

You can provide your own `fetch` for custom behavior (e.g., retry logic, logging):

```js
const rebase = createRebaseClient({
    baseUrl: 'https://api.example.com',
    fetch: myCustomFetch,
});
```

## Error handling

All API errors throw a `RebaseApiError` with structured fields:

```js
import { RebaseApiError } from './generated/sdk/index.js';

try {
    await rebase.posts.findById(999);
} catch (err) {
    if (err instanceof RebaseApiError) {
        console.error(err.status);   // HTTP status code (e.g. 404)
        console.error(err.message);  // Human-readable message
        console.error(err.code);     // Machine-readable error code
        console.error(err.details);  // Additional error details
    }
}
```

## Type generation

The SDK generates **JSDoc `@typedef` blocks** for each collection, giving you IDE auto-complete without TypeScript:

- **`{Collection}`** — The entity shape returned by the API
- **`{Collection}CreateInput`** — Fields accepted when creating a record (auto-generated IDs are excluded)
- **`{Collection}UpdateInput`** — All fields optional for partial updates

### Property type mapping

| Rebase Type | JS Type |
|---|---|
| `string` | `string` |
| `string` (with enum) | Union of enum values |
| `number` | `number` |
| `boolean` | `boolean` |
| `date` | `string` (ISO 8601) |
| `geopoint` | `{ latitude: number, longitude: number }` |
| `reference` | `string \| number` |
| `map` (with properties) | Inline object type |
| `map` (without properties) | `Object` |
| `array` (with `of`) | `Array<elementType>` |
| `array` (without `of`) | `Array<*>` |

### Relation handling

Relations defined in your collections are automatically resolved:

- **Owning (many-to-one)** relations generate a foreign key column (e.g., `author_id`) in the type definitions
- The `include` parameter in `find()` lists available relation names for eager loading
- Relation names are documented in each collection module's JSDoc

## Including relations

Use the `include` parameter to eagerly load related data:

```js
const { data } = await rebase.posts.find({
    include: ['author', 'tags'],
});

// Each post now has author and tags data included
console.log(data[0].author.name);
```

## Tree-shaking support

Individual collection clients are re-exported for applications that only need a subset:

```js
// Import only what you need
import { createPostsClient } from './generated/sdk/posts.js';
import { createTransport } from './generated/sdk/client.js';

const transport = createTransport({
    baseUrl: 'http://localhost:3001',
    token: 'jwt',
});

const posts = createPostsClient(transport);
const { data } = await posts.find({ limit: 5 });
```

## Regenerating the SDK

The generated files include a **"Do not edit manually"** header. Whenever you modify your collection definitions — add a property, change a relation, rename a collection — simply re-run the generator:

```bash
rebase generate-sdk --collections ./src/collections --output ./src/generated/sdk
```

:::caution
The generator **overwrites** the entire output directory. Do not place hand-written files in the SDK output folder.
:::
