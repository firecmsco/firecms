---
slug: "docs/api/functions/getPropertiesWithPropertiesOrder"
title: "getPropertiesWithPropertiesOrder"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getPropertiesWithPropertiesOrder

# Function: getPropertiesWithPropertiesOrder()

> **getPropertiesWithPropertiesOrder**(`properties`, `propertiesOrder?`): [`Properties`](../type-aliases/Properties)

Defined in: [core/src/util/property\_utils.tsx:106](https://github.com/rebasepro/rebase/blob/main/packages/core/src/util/property_utils.tsx)

Get properties sorted by their order, but include ALL properties.
Nested keys (like "data.mode") in propertiesOrder are ignored - they're for column ordering.

## Parameters

### properties

[`Properties`](../type-aliases/Properties)

### propertiesOrder?

`string`[]

## Returns

[`Properties`](../type-aliases/Properties)
