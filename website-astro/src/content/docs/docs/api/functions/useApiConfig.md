---
slug: "docs/api/functions/useApiConfig"
title: "useApiConfig"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useApiConfig

# Function: useApiConfig()

> **useApiConfig**(): [`ApiConfig`](../interfaces/ApiConfig) \| `undefined`

Defined in: [core/src/hooks/ApiConfigContext.tsx:21](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/ApiConfigContext.tsx)

Read the API config from context. Returns `undefined` if no provider is present,
allowing hooks to fall back to their own props.

## Returns

[`ApiConfig`](../interfaces/ApiConfig) \| `undefined`
