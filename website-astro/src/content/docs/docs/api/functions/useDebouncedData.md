---
slug: "docs/api/functions/useDebouncedData"
title: "useDebouncedData"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useDebouncedData

# Function: useDebouncedData()

> **useDebouncedData**\<`T`\>(`data`, `deps`, `timeoutMs`): `T`[]

Defined in: [core/src/components/common/useDebouncedData.ts:12](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDebouncedData.ts)

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
