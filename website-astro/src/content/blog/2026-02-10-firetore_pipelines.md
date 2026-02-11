
---
slug: firestore_pipelines
title: "Firestore Pipeline Operations: What They Are and Why They Matter"
description: Explore Firestore's new Pipeline Operations API for Enterprise Edition—aggregation with grouping, array unnesting, post-aggregation filtering, and index-free queries.
pubDate: 2026-02-10
image: /img/blog/pipeline.webp
authors: francesco
---

![Firestore Pipeline Operations](/img/blog/pipeline.webp)

# Firestore Pipeline Operations: What They Are and Why They Matter
Firestore has historically excelled at real-time document reads and writes, but fell short when it came to analytical workloads. Grouping, summing across collections, or flattening nested arrays required pulling data client-side or piping it into BigQuery. The new **Pipeline Operations API**, available in Firestore Enterprise Edition (Native Mode), removes most of those limitations.
I connected to a live Enterprise instance, seeded test data, and ran actual queries. This article covers what works, how the syntax looks in practice, and what you need to watch out for.
## How It Works
Pipeline Operations introduce a stage-based query model. You start from a data source (a collection, a collection group, or even the entire database), then chain stages that filter, transform, aggregate, or reshape the data. Execution happens server-side—the client only receives the final result.
```
Collection → Filter → Unnest → Aggregate → Sort → Limit → Result
```
This is conceptually similar to MongoDB's aggregation pipelines or SQL CTEs. The key difference from standard Firestore queries: **stages are explicitly ordered**, and each stage operates on the output of the previous one.
## Setting Up
Pipeline support landed in `@google-cloud/firestore` v8.x. The `firebase-admin` SDK (v13.x) still bundles v7.x of the underlying client, so you need to install the newer version directly:
```bash
npm install @google-cloud/firestore@8.3.0
```
Initialization requires specifying the Enterprise database ID:
```javascript
const { Firestore, Pipelines } = require('@google-cloud/firestore');
const { field, equal, sum, count, ascending, descending } = Pipelines;
const db = new Firestore({
    projectId: 'your-project-id',
    keyFilename: './serviceAccountKey.json',
    databaseId: 'default'
});
```
The entry point is `db.pipeline()`, which returns a `PipelineSource`. From there, you chain `.collection()`, `.where()`, `.aggregate()`, and other stages.
## What You Can Actually Do
### Aggregation with Grouping
Standard Firestore supports `count()`, `sum()`, and `average()` as standalone aggregation queries, but they can't group by a field. Pipelines can.
Here's a query that computes revenue and order count per product, filtered to shipped orders only:
```javascript
const snapshot = await db.pipeline()
    .collection('orders')
    .where(equal(field('status'), 'shipped'))
    .aggregate({
        accumulators: [
            sum(field('totalAmount')).as('revenue'),
            count(field('productId')).as('orderCount')
        ],
        groups: [field('productId')]
    })
    .execute();
snapshot.results.forEach(r => console.log(r.data()));
// { productId: 'p1', revenue: 300, orderCount: 2 }
// { productId: 'p2', revenue: 50, orderCount: 1 }
```
The `.aggregate()` stage accepts an `accumulators` array (the values to compute) and a `groups` array (the fields to bucket by). Without `groups`, the entire collection collapses to a single result.
Available accumulators include `sum`, `average`, `count`, `countDistinct`, `minimum`, and `maximum`.
### Array Unnesting
This is arguably the most significant addition for document-model databases. Consider an `orders` collection where each document contains an `items` array:
```json
{
  "status": "shipped",
  "items": [
    { "name": "Widget A", "qty": 2, "price": 50 },
    { "name": "Widget B", "qty": 1, "price": 100 }
  ]
}
```
With `.unnest()`, you can expand each array element into its own row:
```javascript
const snapshot = await db.pipeline()
    .collection('orders')
    .unnest(field('items').as('item'))
    .execute();
// One order with 2 items → 2 results
// Each result contains all original fields + a flattened `item` field
```
Combined with aggregation, this lets you answer questions like "what's the total quantity sold per product name across all orders" entirely server-side—no client processing needed.
### Post-Aggregation Filtering
Because stages execute in order, you can filter *after* aggregating. For example, find only products with more than $100 in revenue:
```javascript
const snapshot = await db.pipeline()
    .collection('orders')
    .aggregate({
        accumulators: [sum(field('totalAmount')).as('revenue')],
        groups: [field('productId')]
    })
    .where(greaterThan(field('revenue'), 100))
    .sort(field('revenue').descending())
    .execute();
```
This is equivalent to SQL's `HAVING` clause. In standard Firestore, there is no way to express this.
### Index-Free Queries
In Standard Firestore, every query pattern requires a matching composite index. Enterprise Pipelines remove this requirement—queries run against the raw data via collection scans when no suitable index exists.
This has real implications for tools like FireCMS, where users define arbitrary filters at runtime. Instead of pre-creating indexes for every possible field combination, you can let the pipeline engine scan.
The trade-off is performance and cost. Unindexed scans read every document in the collection, and billing is based on data volume (4KB chunks), not document count. For small to mid-size collections, this is perfectly fine. For millions of documents, you'll want to create indexes for your hot paths and use Query Explain to monitor execution.
## Additional Capabilities
Beyond the headline features, the SDK exposes a rich set of pipeline operations:
| Stage | Purpose |
|---|---|
| `select()` | Project specific fields (reduces data transferred) |
| `addFields()` | Compute new fields from expressions |
| `removeFields()` | Drop fields from results |
| `distinct()` | Return unique combinations of fields |
| `sample()` | Random sampling (by count or percentage) |
| `union()` | Combine results from two pipelines |
| `findNearest()` | Vector similarity search |
| `replaceWith()` | Replace document structure with a nested map |
| `offset()` / `limit()` | Pagination primitives |
The expression system includes string functions (`regexMatch`, `substring`, `startsWith`), math operators (`add`, `multiply`, `mod`), timestamp manipulation (`timestampAdd`, `timestampSubtract`), and map operations (`mapGet`, `mapMerge`).
## Billing: Standard vs Enterprise
This is the part that requires careful evaluation.
| | Standard Edition | Enterprise Edition |
|---|---|---|
| **Read billing** | Per document | Per 4KB of data read |
| **Write billing** | Per document | Per 1KB of data written |
| **Index requirement** | Mandatory | Optional |
| **Query engine** | Core operations only | Core + Pipeline operations |
If your workload consists of reading small documents by ID, Standard is likely cheaper. If you're scanning collections for analytics, Enterprise's unit-based billing can be more predictable—but large unindexed scans will consume units proportional to the total data volume.
## Current Limitations
The API is in preview. A few constraints to be aware of:
- **No emulator support.** You must test against a live Enterprise database.
- **No realtime listeners or offline support** for pipeline queries (use Core operations for those).
- **No native pagination cursors** (`startAt` / `startAfter`). You need to implement cursor-based pagination manually using `where()` + `sort()`.
- **`array-contains` and vector indexes** are not yet leveraged by the pipeline engine. These queries work but fall back to less efficient index types.
- **60-second deadline** and **128 MiB memory limit** on pipeline execution.

## What This Means for FireCMS

For those of us building admin panels and content management tools on top of Firestore, Pipeline Operations solve a longstanding problem: **flexible, ad-hoc querying without index overhead**.

A CMS user who wants to filter a collection by three different fields, sort by a fourth, and see aggregate counts doesn't care about composite index restrictions. With Enterprise Pipelines, the database handles it. The cost is a slightly different billing model and the requirement to run an Enterprise database instance.
For data-heavy use cases—analytics dashboards, reporting views, bulk data exports—this is a meaningful step forward for Firestore as a platform.

---

**Resources:**
- [Firestore Enterprise Overview](https://firebase.google.com/docs/firestore/enterprise/pipelines-overview)
- [Pipeline Operations Guide](https://firebase.google.com/docs/firestore/pipelines/get-started-with-pipelines)