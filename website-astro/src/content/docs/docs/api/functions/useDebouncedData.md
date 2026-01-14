---
slug: "docs/api/functions/useDebouncedData"
title: "useDebouncedData"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useDebouncedData

# Function: useDebouncedData()

> **useDebouncedData**\<`T`\>(`data`, `deps`, `timeoutMs`): `T`[]

Defined in: [components/common/useDebouncedData.ts:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDebouncedData.ts)

Hack to prevent data updates for incomplete callbacks from Firestore
triggers.
If any deps change, the update is immediate

## Type Parameters

### T

`T`

## Parameters

### data

`T`[]

### deps

`any`

### timeoutMs

`number` = `5000`

## Returns

`T`[]
