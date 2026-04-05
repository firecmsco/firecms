---
slug: "docs/api/functions/useData"
title: "useData"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useData

# Function: useData()

> **useData**(): [`RebaseData`](../interfaces/RebaseData)

Defined in: [core/src/hooks/data/useData.tsx:16](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useData.tsx)

Use this hook to access the unified data API.

```ts
const data = useData();
const { data: products } = await data.products.find({ where: { status: "eq.published" } });
await data.products.create({ name: "Camera", price: 299 });
```

## Returns

[`RebaseData`](../interfaces/RebaseData)
