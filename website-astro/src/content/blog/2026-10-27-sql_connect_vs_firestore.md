---
slug: sql_connect_vs_firestore
title: "Firebase SQL Connect vs Firestore: I Built the Same Store on Both"
description: "Firebase Data Connect is now SQL Connect, with realtime, offline caching and native SQL. I built the same store on SQL Connect, Firestore Standard and Firestore Enterprise and ran the same reads, reports, transactions and realtime tests on all three."
seoTitle: "Firebase SQL Connect vs Firestore: Tested Side by Side"
seoDescription: "Same data, three databases: SQL Connect, Firestore Standard and Firestore Enterprise. Joins, group-by reports, transactions, security, realtime and caching, with the read counts and the gotchas I hit along the way."
pubDate: 2026-10-27
image: /img/blog/jan-antonin-kolar-lRoX0shwjUQ-unsplash.jpg
authors: francesco
---

![Wooden library card catalog drawers](/img/blog/jan-antonin-kolar-lRoX0shwjUQ-unsplash.jpg)

In April, Firebase renamed Data Connect to **Firebase SQL Connect**. It also gave it the
three features people kept asking for: realtime queries, an offline client cache and
native SQL. Over the same months Firestore Enterprise made pipelines generally available
and added subqueries (joins, in effect) and bulk updates and deletes. Each one is picking
up features the other was known for.

So the question I get more and more is no longer "should I use a SQL database?". It is
"Firebase gives me two databases now. Which one?"

I didn't want to answer from the docs, so I built the same small store three times: on
SQL Connect, on Firestore Standard and on Firestore Enterprise. Then I ran the same
operations against each. This article is what happened.

## The short answer

| | Firestore | SQL Connect |
| --- | --- | --- |
| **Data model** | Documents, usually denormalized | Postgres tables with foreign keys |
| **Who writes the queries** | The client, checked by security rules | You, ahead of time; clients call them by name |
| **Joins and reports** | Standard: no. Enterprise: pipelines | Yes, generated or in raw SQL |
| **Realtime** | Every write, from anywhere | Only writes made through SQL Connect mutations, or polling every 10 s or more |
| **Offline on the web** | Persistent (IndexedDB) | In memory only |
| **Billing** | Per document read and write | Per operation, plus a Cloud SQL instance |
| **Fixed cost** | None | From about $9/month after the free trial |

Use Firestore when the app is built around live documents. Use SQL Connect when it is
built around relationships and reports. The details below matter more than this table.

## The setup

The store is deliberately ordinary: 6 categories, 120 products, 300 customers, 3,000 orders
and 7,414 order lines. Both databases hold the same data with the same IDs.

The Firestore version is modelled the way you would model it in Firestore. Each order
document embeds its lines, and the product and category names are copied in:

```js
// orders/{orderId}
{
  customerId: "uid_80",
  customerName: "Customer 80",
  status: "shipped",
  items: [
    { productId, productName: "Tea item 038", categoryId, categoryName: "Tea", quantity: 1, unitPrice: 9.87 },
    // ...
  ],
  total: 71.47
}
```

The SQL Connect version is a GraphQL schema that becomes five Postgres tables:

```graphql
type Product @table {
  name: String!
  price: Float!
  stock: Int!
  category: Category!
}

type Order @table {
  customer: Customer!
  status: String!
  createdAt: Timestamp! @default(expr: "request.time")
}

type OrderItem @table(key: ["order", "product"]) {
  order: Order!
  product: Product!
  quantity: Int!
  unitPrice: Float!
}
```

Everything ran on the local emulators: firebase-tools 15.34.1, the firebase JS SDK 13.1.0,
the SQL Connect emulator 3.4.24 (backed by PGlite, which reports Postgres 17.5) and the
Firestore emulator 1.22.0. The Firestore emulator now runs in **Enterprise edition** too,
which it couldn't when I [tested pipelines in February](/blog/firestore_pipelines). That
makes this comparison possible without any cloud bill.

Emulators are not production, so I don't quote latencies as performance numbers. What I
report is how much billable work each approach does and how each one behaves.

### What SQL Connect actually is

If you haven't used it: SQL Connect is a managed GraphQL layer over Cloud SQL for
Postgres. You write the schema and every query and mutation your app will run in `.gql`
files, then deploy them. The client SDK is generated from those files, and clients can
only call the operations you deployed. A client cannot send its own query.

A detail I liked: from that schema, SQL Connect created an index on every foreign key
(`order.customer_id`, `product.category_id`, both columns of `order_item`). Missing
foreign-key indexes are one of the most common Postgres performance problems, and here
you don't have to remember them.

A detail to know: UUIDs come back as 32 hex characters without dashes
(`e5e82f59186b4c80913512233896d714`). That matters later.

## Test 1: Read one order

**Firestore.** The order is one document, so it costs one read. That's the point of
embedding. If you normalize instead and keep only product IDs in the order, the same
screen costs 5 reads for a two-line order: the order, two products and two categories.

**SQL Connect.** One operation, three joins deep:

```graphql
query GetOrder($id: UUID!) @auth(level: USER) {
  orders(where: { id: { eq: $id }, customerId: { eq_expr: "auth.uid" } }) {
    status
    customer { name }
    orderItems_on_order {
      quantity
      unitPrice
      product { name category { name } }
    }
  }
}
```

Look at `customerId: { eq_expr: "auth.uid" }`. The ownership filter is part of the
deployed query and runs on the server. When I called it signed out, `@auth` rejected it.
When I called it as another user, it returned an empty list. The client has no way to
remove the filter, because the client never sees the query.

For one screen, both are cheap. Firestore wins on simplicity if you embed. SQL Connect
wins if the same data has to appear in many different shapes.

## Test 2: Reports

This is where the two differ most. I asked three questions:

- **Stock and average price per category.** Firestore Standard: 6 aggregate queries,
  6 reads. SQL Connect: 1 query.
- **Revenue per category, summed from the order lines.** Firestore Standard: read all
  3,000 orders and add them up in the client. Firestore Enterprise: 1 pipeline.
  SQL Connect: 1 native SQL query.
- **Products nobody has ordered.** Firestore Standard: read all 3,000 orders and 120
  products. Firestore Enterprise: 1 pipeline with a subquery. SQL Connect: 1 query.

All three gave the same revenue figures, to the cent.

**Per-category stock** is the case Firestore Standard handles well. `count()`, `sum()` and
`average()` run on the server and cost one read per 1,000 index entries. There is no
`GROUP BY`, though, so you run one query per category. SQL Connect's generated aggregates
group automatically by whatever plain fields you select:

```graphql
query StockByCategory @auth(level: PUBLIC) {
  products { categoryId _count stock_sum price_avg }
}
```

It groups by `categoryId`, not the category name. To group across a join you need native
SQL or a `@view`.

**Revenue per category** is out of reach for Firestore Standard. The amounts sit inside
the `items` array, and Standard aggregates can't look inside arrays or group. So you read
every order, which here is 3,000 reads each time the report loads. The usual fix is to
keep running totals updated on every write, which is more code and another thing that can
drift.

Firestore Enterprise does it in one pipeline:

```js
const snap = await execute(db.pipeline().collection("orders")
  .unnest(field("items").as("item"))
  .aggregate({
    accumulators: [
      sum(multiply(field("item.quantity"), field("item.unitPrice"))).as("revenue"),
      countDistinct(field("__name__")).as("orders"),
    ],
    groups: [field("item.categoryName").as("category")],
  })
  .sort(field("revenue").descending()));
```

SQL Connect does it in native SQL, which arrived in March. The SQL is checked at deploy
time and its parameters are bound on the server, so clients still can't change it:

```graphql
query RevenueByCategory @auth(level: PUBLIC) {
  _select(sql: """
    SELECT c.name AS category,
           SUM(oi.quantity * oi.unit_price) AS revenue,
           COUNT(DISTINCT oi.order_id) AS orders
    FROM order_item oi
    JOIN product p ON p.id = oi.product_id
    JOIN category c ON c.id = p.category_id
    GROUP BY c.name
    ORDER BY revenue DESC
  """, params: [])
}
```

The cost of native SQL is typing. `_select` returns `Any`, so the generated SDK can't type
the result and you have to validate its shape yourself.

**Products never ordered** is an anti-join. In SQL Connect it's a filter:

```graphql
products(where: { _not: { orderItems_on_product: { exist: {} } } }) { id name }
```

In Firestore Standard you read everything (3,120 reads) and compare in code. In Firestore
Enterprise you can write it with the new subqueries: for each product, count the order
lines that reference it and keep the zeros. It returned the right 8 products, but it took
10 seconds in the emulator, because it rescans every order for each of the 120 products.
The emulator isn't a guide to production speed, but the shape of that query is a warning.
Pipelines can express a join; that doesn't make them a relational engine.

## Test 3: Place an order

Placing an order has to check stock, create the order, add the line and decrement stock,
all or nothing. Both databases can do this. They differ in **where the logic runs**.

In SQL Connect the whole thing is one deployed mutation:

```graphql
mutation PlaceOrder($productId: UUID!, $quantity: Int!) @auth(level: USER) @transaction {
  query {
    product(id: $productId) @check(expr: "this != null && this.stock >= vars.quantity", message: "Not enough stock") {
      price
      stock
    }
  }
  order_insert(data: { customerId_expr: "auth.uid", status: "placed" })
  orderItem_insert(data: {
    orderId_expr: "response.order_insert.id"
    productId: $productId
    quantity: $quantity
    unitPrice_expr: "response.query.product.price"
  })
  product_update(id: $productId, data: { stock_update: { dec: $quantity } })
}
```

When I asked for one more than the available stock, the check failed with
`Not enough stock (aborted) (rolled back)` and nothing was written. The customer ID comes
from the auth token and the price comes from the database. The client supplies only a
product and a quantity.

In Firestore, the same logic is a `runTransaction` in client code, and that's correct as
far as it goes. But the client is writing documents directly, so your security rules have
to anticipate every write a modified client could send instead. I wrote the rules most
people would write:

```
match /products/{id} {
  allow read: if true;
  // Clients may only lower the stock, and never below zero.
  allow update: if request.auth != null
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stock'])
    && request.resource.data.stock < resource.data.stock
    && request.resource.data.stock >= 0;
}
match /orders/{id} {
  allow read: if request.auth != null && resource.data.customerId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.customerId == request.auth.uid;
}
```

Then I tried them as a signed-in customer:

| Attempt | Result |
| --- | --- |
| Read my orders, `where("customerId", "==", uid)` | Allowed |
| Read orders with no filter | `permission-denied` (rules are not filters) |
| Place an order in a transaction | Allowed |
| Raise a product's stock | `permission-denied` |
| **Set any product's stock to 0 without ordering anything** | **Allowed** |

The rules behave exactly as written, and they still let any signed-in user empty your
inventory. Tying a stock change to a real order is possible with `getAfter()`, but it gets
complicated quickly. In practice this write moves into a Cloud Function, and at that point
you've rebuilt what SQL Connect gives you by default: logic the client can call but can't
rewrite.

SQL Connect also checks your operations at compile time. When I added a few seeding
mutations that accepted whole `Product_Data` objects from the client, the compiler flagged
each one as `INSECURE: missing @allow(fields)`.

## Test 4: Rename a category

In SQL Connect, renaming "Coffee" changes one row, and every query sees the new name.

In Firestore the name lives in many places. I updated the category and its 20 products in
one batch (21 writes). The 1,068 orders that contain coffee still say "Coffee". For an
order history that may be what you want, since an order should record what the customer
saw. But if you wanted them updated, you couldn't even query for them: Firestore can't
filter on a field inside an array of maps. You'd have to add and maintain a `categoryIds`
array just to find them.

Denormalization isn't wrong. It means deciding, for each copy, whether it's a snapshot or
a cache, and writing the code that keeps the caches up to date.

## Test 5: Realtime

This is Firestore's home ground, and it held up. A listener on "products in this
category" received:

| Write | Update arrived |
| --- | --- |
| From another client SDK | 13 ms |
| From a privileged REST call (what the Admin SDK, a script or the console does) | 85 ms |
| From the listening client itself | 3 ms (local, before the server confirmed) |

Any write, from anywhere, reaches the listener. That's what Firestore is built on.

SQL Connect's realtime works differently. The server doesn't watch the database. It
re-runs a subscribed query when a mutation that query is linked to runs. Queries that fetch
a single row by primary key are linked to that row's insert, update and delete mutations
automatically. For lists, joins, aggregates and native SQL, you declare the link with
`@refresh`:

```graphql
query ProductsInCategory($categoryId: UUID!) @auth(level: PUBLIC)
  @refresh(onMutationExecuted: {
    operation: "UpdateStock"
    condition: "request.variables.categoryId == mutation.variables.categoryId"
  }) {
  products(where: { categoryId: { eq: $categoryId } }) { id name stock }
}
```

Here's what reached each kind of subscription:

| Write | Single product by ID (implicit) | List with `@refresh` |
| --- | --- | --- |
| `UpdateStock` mutation | 16–29 ms | 31 ms |
| `PlaceOrder` (also updates the product) | 25 ms | Never: not named in `@refresh` |
| `UPDATE product ...` straight to Postgres | Never | Never |

The only way I found to catch the direct Postgres write was polling: a list query with
`@refresh(every: { seconds: 10 })` picked it up after 8.5 seconds.

When it works, it's fast. But it only knows about writes that go through SQL Connect
mutations, and only the mutations you listed. A migration, a cron job using a plain
Postgres driver, a fix made in the Cloud SQL console, or a bulk `_updateMany` (which the
docs say sends no signal) won't reach subscribers. Polling is the fallback, and the
compiler rejects intervals under 10 seconds.

Two more things I found:

**The condition above never fired.** I copied that pattern from the docs, and it silently
did nothing. The emulator log showed the condition evaluating to false for identical IDs.
The query's variables reach the condition normalized to the dashless form, while the
mutation's variables arrive exactly as the client sent them, with dashes. Send dashless
UUIDs (the form SQL Connect returns) and it fires in 31 ms. Send `crypto.randomUUID()`
output, or an ID from your URL, and subscribers never hear about the change. I could only
test this in the emulator, but it's worth a test in yours.

**What updates depends on what else is open.** The client cache is normalized, so when
the single-product subscription refreshed from the server, the list subscription on the
same screen also updated, from cache, even when its own `@refresh` didn't match. Pleasant
when it happens. Confusing when you're trying to work out why a list updates on one screen
and not on another.

## Test 6: Offline

Realtime needs the client cache, which you enable in `connector.yaml`:

```yaml
generate:
  javascriptSdk:
    clientCache:
      maxAge: 5s
      storage: memory
```

On the web, `memory` is the only option. The cache lasts for one page session; an
SDK comment says IndexedDB is planned. So SQL Connect's offline support on the web means
"keeps working through a dropped connection". It doesn't mean Firestore's "opens with
yesterday's data on a plane", which Firestore does with its persistent cache.

## Cost

The pricing models differ in kind, which is why "which is cheaper" has no general answer.

- **Firestore Standard** charges per document: in `us-central1`, $0.03 per 100,000 reads
  and $0.09 per 100,000 writes. The free tier is 50,000 reads and 20,000 writes a day.
  Listeners are billed one read for each document added to or changed in their results.
- **Firestore Enterprise** charges by data volume (4 KB read units, 1 KB write units)
  rather than by document. Large scans cost in proportion to the data they touch.
- **SQL Connect** charges $0.90 per million operations after 250,000 free a month, and
  "there is no per-row-read fee". On top of that you pay for the Cloud SQL instance, from
  about $9.37 a month. There's a no-cost trial instance for 90 days (Spark plan, then
  archived) or 3 months (Blaze, then standard pricing).

Three examples from the store:

1. **Order history, 20 orders per view, 1 million views a month.** Firestore with embedded
   lines: 20 million reads, about $6. SQL Connect: 1 million operations, about $0.68, plus
   the instance.
2. **The revenue report over 100,000 orders, opened 1,000 times a month.** Firestore
   Standard: 100 million reads, about $30, unless you maintain totals. SQL Connect: 1,000
   operations, inside the free tier. Enterprise: depends on the bytes scanned, which the
   emulator can't tell you.
3. **A polling subscription.** Firebase's announcement says the operation price covers
   realtime subscriptions, but the pricing page doesn't say whether each refresh counts. If
   it does, one screen left open with `@refresh(every: { seconds: 10 })` makes 259,200
   refreshes a month, slightly more than the whole free tier. Measure it in your billing
   console before relying on polling.

Below a certain size, Firestore's lack of a fixed cost wins easily. Once your Firestore
bill is mostly reads spent rebuilding relationships, it's worth pricing the instance.

## When to pick which

**Pick Firestore** when:
- Realtime is the product: chat, collaboration, live boards, anything where writes come
  from many places and every client must see them.
- You need offline-first apps with data that persists across restarts.
- Your screens read whole documents: a page, a profile, an order with its lines.
- You want no fixed cost and no server-side code to deploy for each new query.

**Pick SQL Connect** when:
- Your data is relational: many-to-many links, shared reference data, reports that cross
  tables.
- Integrity matters: foreign keys, unique constraints, multi-table transactions, and
  business rules the client can call but not rewrite.
- Other tools need the data: BI, migrations, `pg_dump`, anything that speaks Postgres.

**Consider Firestore Enterprise** if you're on Firestore and mainly missing reporting.
Pipelines handle grouping, array unnesting and now subqueries. But they bill by data
volume, they have no realtime listeners, and a subquery join is not a query planner.

**Or use both.** They share Firebase Auth. Many apps keep live, user-facing documents in
Firestore and orders, billing and reporting in Postgres.

## What this means for FireCMS

FireCMS is built for Firestore, and none of this changes that. If anything, Enterprise
pipelines make Firestore better at what admin panels need: filtering and grouping on
fields nobody planned an index for (see the
[pipelines write-up](/blog/firestore_pipelines)).

If your answer to the question in this article is "Postgres", our sister project
[Rebase](https://rebase.pro) takes the same idea to a Postgres database you own: one
collection definition gives you the API, the access policies and an admin panel.

Either way, choose the database for your data. The admin panel is easier to change later
than the data model.

---

**Resources:**
- [Firebase SQL Connect documentation](https://firebase.google.com/docs/sql-connect)
- [Realtime updates in SQL Connect](https://firebase.google.com/docs/sql-connect/realtime)
- [Native SQL in SQL Connect](https://firebase.google.com/docs/sql-connect/native-sql)
- [SQL Connect pricing](https://firebase.google.com/docs/sql-connect/pricing)
- [Firestore pricing](https://firebase.google.com/docs/firestore/pricing)
- [Firestore Pipeline Operations: what they are and why they matter](/blog/firestore_pipelines)
