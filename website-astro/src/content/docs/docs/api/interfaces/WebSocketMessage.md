---
slug: "docs/api/interfaces/WebSocketMessage"
title: "WebSocketMessage"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / WebSocketMessage

# Interface: WebSocketMessage

Defined in: [types/src/types/websockets.ts:9](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

## Extended by

- [`CollectionUpdateMessage`](CollectionUpdateMessage)
- [`EntityUpdateMessage`](EntityUpdateMessage)

## Properties

### entities?

> `optional` **entities**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\>[]

Defined in: [types/src/types/websockets.ts:14](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [types/src/types/websockets.ts:15](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### error?

> `optional` **error**: `string`

Defined in: [types/src/types/websockets.ts:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### payload?

> `optional` **payload**: `unknown`

Defined in: [types/src/types/websockets.ts:11](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/src/types/websockets.ts:13](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### subscriptionId?

> `optional` **subscriptionId**: `string`

Defined in: [types/src/types/websockets.ts:12](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### type

> **type**: `string`

Defined in: [types/src/types/websockets.ts:10](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)
