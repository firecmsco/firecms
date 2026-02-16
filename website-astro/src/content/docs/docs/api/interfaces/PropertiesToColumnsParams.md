---
slug: "docs/api/interfaces/PropertiesToColumnsParams"
title: "PropertiesToColumnsParams"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertiesToColumnsParams

# Interface: PropertiesToColumnsParams\<M\>

Defined in: [components/EntityCollectionTable/column\_utils.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/column_utils.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### AdditionalHeaderWidget?

> `optional` **AdditionalHeaderWidget**: `ComponentType`\<\{ `onHover`: `boolean`; `property`: [`ResolvedProperty`](../type-aliases/ResolvedProperty); `propertyKey`: `string`; \}\>

Defined in: [components/EntityCollectionTable/column\_utils.tsx:24](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/column_utils.tsx)

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<keyof `M` *extends* `string` ? keyof `any` : `never`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [components/EntityCollectionTable/column\_utils.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/column_utils.tsx)

***

### properties

> **properties**: [`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`M`\>

Defined in: [components/EntityCollectionTable/column\_utils.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/column_utils.tsx)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [components/EntityCollectionTable/column\_utils.tsx:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/column_utils.tsx)
