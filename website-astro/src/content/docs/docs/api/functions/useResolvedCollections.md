---
slug: "docs/api/functions/useResolvedCollections"
title: "useResolvedCollections"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useResolvedCollections

# Function: useResolvedCollections()

> **useResolvedCollections**\<`EC`, `USER`\>(`props`): [`UseResolvedCollectionsResult`](../type-aliases/UseResolvedCollectionsResult)

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:40](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

Hook that resolves collection props (which may be async builders or arrays)
into concrete EntityCollection[], and registers them with the CollectionRegistry.

Uses refs for potentially-unstable dependencies (driver, authController,
plugins) to avoid re-triggering effects when their object identity changes.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### props

[`UseResolvedCollectionsProps`](../type-aliases/UseResolvedCollectionsProps)\<`EC`, `USER`\>

## Returns

[`UseResolvedCollectionsResult`](../type-aliases/UseResolvedCollectionsResult)
