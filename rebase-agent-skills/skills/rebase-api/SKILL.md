---
name: rebase-api
description: Guide for working with Rebase auto-generated REST and GraphQL APIs. Use this skill when the user needs to understand the API endpoints, query parameters, filtering, sorting, pagination, or GraphQL schema.
---

# Rebase Auto-Generated APIs

Every collection defined in Rebase automatically gets full REST CRUD and GraphQL endpoints. No manual route creation needed.

## REST API

### Endpoint Convention

All REST data endpoints follow the pattern:

```
BASE_URL/api/data/{slug}
```

Where `slug` is the collection's slug (e.g., `products`, `users`, `blog-posts`).

Other API categories use their own base paths:

| Base Path | Purpose |
|-----------|---------|
| `/api/data/{slug}` | Collection CRUD (auto-generated) |
| `/api/auth/*` | Authentication (login, register, refresh) |
| `/api/admin/*` | User & role management |
| `/api/storage/*` | File uploads and downloads |
| `/api/schema-editor/*` | Visual schema editor (dev only) |

### CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/data/{slug}` | List documents (with filtering, sorting, pagination) |
| `GET` | `/api/data/{slug}/:id` | Get a single document by ID |
| `POST` | `/api/data/{slug}` | Create a new document |
| `PUT` | `/api/data/{slug}/:id` | Update a document (full replace) |
| `PATCH` | `/api/data/{slug}/:id` | Partial update a document |
| `DELETE` | `/api/data/{slug}/:id` | Delete a document |

### Query Parameters (GET List)

| Parameter | Description | Example |
|-----------|-------------|---------|
| `limit` | Max results per page (default: 25) | `?limit=50` |
| `offset` | Skip N results | `?offset=25` |
| `orderBy` | Sort field | `?orderBy=created_at` |
| `order` | Sort direction (`asc`/`desc`) | `?order=desc` |
| `filter[field][op]` | Field filter | `?filter[price][gte]=100` |

### Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `?filter[status][eq]=active` |
| `neq` | Not equal | `?filter[status][neq]=archived` |
| `gt` | Greater than | `?filter[price][gt]=50` |
| `gte` | Greater than or equal | `?filter[price][gte]=50` |
| `lt` | Less than | `?filter[price][lt]=100` |
| `lte` | Less than or equal | `?filter[price][lte]=100` |
| `like` | Pattern match (SQL LIKE) | `?filter[name][like]=%widget%` |
| `in` | In list | `?filter[status][in]=active,published` |

### Response Format

```json
{
  "data": [
    { "id": "uuid-1", "name": "Product A", "price": 29.99 },
    { "id": "uuid-2", "name": "Product B", "price": 49.99 }
  ],
  "pagination": {
    "total": 150,
    "limit": 25,
    "offset": 0,
    "hasMore": true
  }
}
```

### Authentication

All API requests require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## GraphQL API

### Endpoint

```
BASE_URL/api/data/graphql
```

GraphQL is optional and must be explicitly enabled in `app/backend/src/index.ts` (see commented-out section in the template).

### Auto-Generated Schema

For each collection, Rebase generates:
- **Query**: `{collectionName}` (list), `{collectionName}ById` (single)
- **Mutation**: `create{CollectionName}`, `update{CollectionName}`, `delete{CollectionName}`

### Example Query

```graphql
query {
  products(
    limit: 10,
    offset: 0,
    orderBy: "created_at",
    order: DESC,
    filter: { price: { gte: 50 } }
  ) {
    data {
      id
      name
      price
      category
      created_at
    }
    pagination {
      total
      hasMore
    }
  }
}
```

### Example Mutation

```graphql
mutation {
  createProduct(input: {
    name: "New Widget",
    price: 19.99,
    category: "electronics"
  }) {
    id
    name
    price
  }
}
```

## References

- **REST Query Parsing:** See [references/rest-query-parsing.md](references/rest-query-parsing.md) for detailed filter/sort logic.
- **GraphQL Schema:** See [references/graphql-schema.md](references/graphql-schema.md) for the full auto-generated schema.
- **Error Handling:** See [references/error-handling.md](references/error-handling.md) for API error codes and formats.
