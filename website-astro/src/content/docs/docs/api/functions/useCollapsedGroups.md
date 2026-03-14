---
slug: "docs/api/functions/useCollapsedGroups"
title: "useCollapsedGroups"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useCollapsedGroups

# Function: useCollapsedGroups()

> **useCollapsedGroups**(`groupNames`): `object`

Defined in: [hooks/useCollapsedGroups.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useCollapsedGroups.ts)

Custom hook for managing collapsed/expanded state of navigation groups
with localStorage persistence. Automatically cleans up stale group entries
when groups are removed from the navigation.

## Parameters

### groupNames

`string`[]

## Returns

`object`

### isGroupCollapsed()

> **isGroupCollapsed**: (`name`) => `boolean`

#### Parameters

##### name

`string`

#### Returns

`boolean`

### toggleGroupCollapsed()

> **toggleGroupCollapsed**: (`name`) => `void`

#### Parameters

##### name

`string`

#### Returns

`void`
