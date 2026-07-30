# FireCMS — graph datasource demo (slashes in entity IDs)

A minimal FireCMS app running against an **in-memory graph-style datasource** whose entity
IDs contain slashes (`node/42`, `edge/7/rel`). No Firebase, no config, no login — it runs
straight from a checkout.

Firestore forbids `/` in a document ID, so this behaviour is impossible to exercise
against the default backend. This example stands in for a custom `DataSourceDelegate`
backed by a graph database.

```bash
pnpm graph          # from the repo root
```

Then open http://localhost:5183.

The Vite config aliases `@firecms/core`, `@firecms/ui` and `@firecms/formex` to the
workspace **sources**, so edits to those packages show up here without a rebuild.

## What to look at

| Entity ID | Why it is here |
|---|---|
| `node/42` | One slash — the basic case |
| `edge/7/rel` | Two slashes |
| `plain-id-no-slash` | Control: must behave exactly as before |
| `weird%2Fnot-a-slash` | Control: ID containing the literal text `%2F`. Must resolve to itself, **not** to `weird/not-a-slash` |
| `50% confidence` | Control: a literal `%` plus a space |

Open one and check three things:

1. **The URL is a single path segment.** `node/42` becomes
   `/c/nodes/node%252F42` — escaped once by `encodeEntityId` (`/` → `%2F`) and once more
   by the URL layer (`%` → `%25`).
2. **The delegate receives the RAW ID.** `fetchEntity` logs to the console; it is called
   with `node/42`, never the escaped form. This is what keeps existing datasource
   implementations — Firestore included — working untouched.
3. **Deep links work cold.** Paste an entity URL into a new tab. It resolves without any
   in-memory navigation state, which is the part that a naive "escape on click" fix misses.

## Known limitation

A slash-bearing ID in a **parent** position of a subcollection path is still ambiguous:
the datasource receives `nodes/a/b/locales`, where `a/b` cannot be told apart from a
collection separator once flattened. Leaf entities are unaffected. Fixing this means
passing parent IDs structurally through the `DataSource` API rather than as one joined
string.
