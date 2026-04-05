---
slug: "docs/api/interfaces/CollectionUpdateMessage"
title: "CollectionUpdateMessage"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionUpdateMessage

# Interface: CollectionUpdateMessage

Defined in: [types/src/types/websockets.ts:19](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

## Extends

- [`WebSocketMessage`](WebSocketMessage)

## Properties

### entities

> **entities**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\>[]

Defined in: [types/src/types/websockets.ts:22](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`entities`](WebSocketMessage.md#entities)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [types/src/types/websockets.ts:15](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`entity`](WebSocketMessage.md#entity)

***

### error?

> `optional` **error**: `string`

Defined in: [types/src/types/websockets.ts:16](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`error`](WebSocketMessage.md#error)

***

### payload?

> `optional` **payload**: `unknown`

Defined in: [types/src/types/websockets.ts:11](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`payload`](WebSocketMessage.md#payload)

***

### requestId?

> `optional` **requestId**: `string`

Defined in: [types/src/types/websockets.ts:13](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`requestId`](WebSocketMessage.md#requestid)

***

### subscriptionId

> **subscriptionId**: `string`

Defined in: [types/src/types/websockets.ts:21](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`subscriptionId`](WebSocketMessage.md#subscriptionid)

***

### type

> **type**: `"collection_update"`

Defined in: [types/src/types/websockets.ts:20](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`type`](WebSocketMessage.md#type)
