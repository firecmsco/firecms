---
slug: "docs/api/interfaces/ApiConfig"
title: "ApiConfig"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ApiConfig

# Interface: ApiConfig

Defined in: [core/src/hooks/ApiConfigContext.tsx:10](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/ApiConfigContext.tsx)

Configuration for API connectivity. Passed once at the top level
and available to any hook that needs `apiUrl` or `getAuthToken`.

Individual hooks can still accept explicit overrides — this context
serves as a fallback to eliminate repetitive threading.

## Properties

### apiUrl

> **apiUrl**: `string`

Defined in: [core/src/hooks/ApiConfigContext.tsx:11](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/ApiConfigContext.tsx)

***

### getAuthToken()?

> `optional` **getAuthToken**: () => `Promise`\<`string` \| `null`\>

Defined in: [core/src/hooks/ApiConfigContext.tsx:12](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/ApiConfigContext.tsx)

#### Returns

`Promise`\<`string` \| `null`\>
