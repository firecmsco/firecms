---
slug: "docs/api/functions/usePermissions"
title: "usePermissions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / usePermissions

# Function: usePermissions()

> **usePermissions**(): `object`

Defined in: [core/src/hooks/usePermissions.ts:10](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/usePermissions.ts)

Hook to evaluate roles and permissions for the current user.
It abstracts away the need to pass `authController` to permission evaluation functions.

## Returns

`object`

### canCreate()

> **canCreate**: (`collection`, `path`) => `boolean`

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

##### path

`string`

#### Returns

`boolean`

### canDelete()

> **canDelete**: (`collection`, `path`, `entity`) => `boolean`

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

##### path

`string`

##### entity

[`Entity`](../interfaces/Entity)\<`any`\> | `null`

#### Returns

`boolean`

### canEdit()

> **canEdit**: (`collection`, `path`, `entity`) => `boolean`

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

##### path

`string`

##### entity

[`Entity`](../interfaces/Entity)\<`any`\> | `null`

#### Returns

`boolean`

### canRead()

> **canRead**: (`collection`) => `boolean`

#### Parameters

##### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

#### Returns

`boolean`
