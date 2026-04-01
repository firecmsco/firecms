---
slug: "docs/api/interfaces/CollectionUpdateMessage"
title: "CollectionUpdateMessage"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionUpdateMessage

# Interface: CollectionUpdateMessage

Defined in: [types/src/types/websockets.ts:13](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

## Extends

- [`WebSocketMessage`](WebSocketMessage)

## Properties

### entities

> **entities**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\>[]

Defined in: [types/src/types/websockets.ts:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`entities`](WebSocketMessage.md#entities)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [types/src/types/websockets.ts:9](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`entity`](WebSocketMessage.md#entity)

***

### error?

> `optional` **error**: `string`

Defined in: [types/src/types/websockets.ts:10](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`error`](WebSocketMessage.md#error)

***

### payload?

> `optional` **payload**: `unknown`

Defined in: [types/src/types/websockets.ts:5](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`payload`](WebSocketMessage.md#payload)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/src/types/websockets.ts:7](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`requestId`](WebSocketMessage.md#requestid)

***

### subscriptionId

> **subscriptionId**: `string`

Defined in: [types/src/types/websockets.ts:15](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`subscriptionId`](WebSocketMessage.md#subscriptionid)

***

### type

> **type**: `"collection_update"`

Defined in: [types/src/types/websockets.ts:14](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`type`](WebSocketMessage.md#type)
