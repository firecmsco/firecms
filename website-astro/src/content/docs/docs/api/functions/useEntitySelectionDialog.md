---
slug: "docs/api/functions/useEntitySelectionDialog"
title: "useEntitySelectionDialog"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useEntitySelectionDialog

# Function: useEntitySelectionDialog()

> **useEntitySelectionDialog**\<`M`\>(`referenceDialogProps`): `object`

Defined in: [core/src/hooks/useEntitySelectionDialog.tsx:16](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/useEntitySelectionDialog.tsx)

This hook is used to open a side dialog that allows the selection
of entities under a given path.
You can use it in custom views for selecting entities.
You need to specify the path of the target collection at least.
If your collection is not defined in your  top collection configuration
(in your `Rebase` component), you need to specify explicitly.
This is the same hook used internally when a reference property is defined.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### referenceDialogProps

`Omit`\<[`EntitySelectionProps`](../interfaces/EntitySelectionProps)\<`M`\>, `"path"`\> & `object`

## Returns

`object`

### close()

> **close**: () => `void`

#### Returns

`void`

### open()

> **open**: () => `void`

#### Returns

`void`
