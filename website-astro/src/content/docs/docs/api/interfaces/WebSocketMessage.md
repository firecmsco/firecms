---
slug: "docs/api/interfaces/WebSocketMessage"
title: "WebSocketMessage"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / WebSocketMessage

# Interface: WebSocketMessage

Defined in: [types/src/types/websockets.ts:3](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

## Extended by

- [`CollectionUpdateMessage`](CollectionUpdateMessage)
- [`EntityUpdateMessage`](EntityUpdateMessage)

## Properties

### entities?

> `optional` **entities**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\>[]

Defined in: [types/src/types/websockets.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [types/src/types/websockets.ts:9](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### error?

> `optional` **error**: `string`

Defined in: [types/src/types/websockets.ts:10](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### payload?

> `optional` **payload**: `unknown`

Defined in: [types/src/types/websockets.ts:5](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/src/types/websockets.ts:7](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### subscriptionId?

> `optional` **subscriptionId**: `string`

Defined in: [types/src/types/websockets.ts:6](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### type

> **type**: `string`

Defined in: [types/src/types/websockets.ts:4](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)
