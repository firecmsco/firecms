---
slug: "docs/api/interfaces/RealtimeProvider"
title: "RealtimeProvider"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RealtimeProvider

# Interface: RealtimeProvider

Defined in: [types/src/types/backend.ts:246](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract realtime provider interface.
Handles real-time subscriptions and notifications for entity changes.

## Methods

### notifyEntityUpdate()

> **notifyEntityUpdate**(`path`, `entityId`, `entity`, `databaseId?`): `Promise`\<`void`\>

Defined in: [types/src/types/backend.ts:273](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Notify all relevant subscribers of an entity update

#### Parameters

##### path

`string`

##### entityId

`string`

##### entity

[`Entity`](Entity)\<`object`\> | `null`

##### databaseId?

`string`

#### Returns

`Promise`\<`void`\>

***

### subscribeToCollection()

> **subscribeToCollection**(`subscriptionId`, `config`, `callback?`): `void`

Defined in: [types/src/types/backend.ts:250](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Subscribe to collection changes

#### Parameters

##### subscriptionId

`string`

##### config

[`CollectionSubscriptionConfig`](CollectionSubscriptionConfig)

##### callback?

(`entities`) => `void`

#### Returns

`void`

***

### subscribeToEntity()

> **subscribeToEntity**(`subscriptionId`, `config`, `callback?`): `void`

Defined in: [types/src/types/backend.ts:259](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Subscribe to single entity changes

#### Parameters

##### subscriptionId

`string`

##### config

[`EntitySubscriptionConfig`](EntitySubscriptionConfig)

##### callback?

(`entity`) => `void`

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(`subscriptionId`): `void`

Defined in: [types/src/types/backend.ts:268](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Unsubscribe from a subscription

#### Parameters

##### subscriptionId

`string`

#### Returns

`void`
