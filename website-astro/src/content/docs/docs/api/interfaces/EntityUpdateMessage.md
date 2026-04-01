---
slug: "docs/api/interfaces/EntityUpdateMessage"
title: "EntityUpdateMessage"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityUpdateMessage

# Interface: EntityUpdateMessage

Defined in: [types/src/types/websockets.ts:19](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

## Extends

- [`WebSocketMessage`](WebSocketMessage)

## Properties

### entities?

> `optional` **entities**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\>[]

Defined in: [types/src/types/websockets.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage).[`entities`](WebSocketMessage.md#entities)

***

### entity

> **entity**: [`Entity`](Entity)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [types/src/types/websockets.ts:22](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

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

Defined in: [types/src/types/websockets.ts:21](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`subscriptionId`](WebSocketMessage.md#subscriptionid)

***

### type

> **type**: `"entity_update"`

Defined in: [types/src/types/websockets.ts:20](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/websockets.ts)

#### Overrides

[`WebSocketMessage`](WebSocketMessage).[`type`](WebSocketMessage.md#type)
