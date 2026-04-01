---
slug: "docs/api/functions/RebaseI18nProvider"
title: "RebaseI18nProvider"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseI18nProvider

# Function: RebaseI18nProvider()

> **RebaseI18nProvider**(`__namedParameters`): `Element` \| `null`

Defined in: core/src/i18n/RebaseI18nProvider.tsx:47

**`Internal`**

Initialises a dedicated i18next instance for FireCMS's internal UI strings.

This instance is isolated from any app-level i18next configuration the
consumer may have. Mount this at the top of the FireCMS component tree.

## Parameters

### \_\_namedParameters

`PropsWithChildren`\<[`RebaseI18nProviderProps`](../interfaces/RebaseI18nProviderProps)\>

## Returns

`Element` \| `null`
