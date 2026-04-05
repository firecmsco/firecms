---
slug: "docs/api/functions/buildRebaseData"
title: "buildRebaseData"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildRebaseData

# Function: buildRebaseData()

> **buildRebaseData**(`driver`): [`RebaseData`](../interfaces/RebaseData)

Defined in: [common/src/data/buildRebaseData.ts:195](https://github.com/rebasepro/rebase/blob/main/packages/common/src/data/buildRebaseData.ts)

Build a `RebaseData` object from a `DataDriver` using JavaScript Proxy.

This is the key bridge: any property access like `data.products` returns
a `CollectionAccessor` backed by the underlying DataDriver, without
needing per-collection code generation.

## Parameters

### driver

[`DataDriver`](../interfaces/DataDriver)

## Returns

[`RebaseData`](../interfaces/RebaseData)

## Example

```ts
const data = buildRebaseData(driver);
await data.products.create({ name: "Camera", price: 299 });
const { data: items } = await data.products.find({ where: { status: "eq.published" } });
```
