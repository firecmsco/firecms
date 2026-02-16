---
slug: "docs/api/functions/useReferenceDialog"
title: "useReferenceDialog"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useReferenceDialog

# Function: useReferenceDialog()

> **useReferenceDialog**\<`M`\>(`referenceDialogProps`): `object`

Defined in: [hooks/useReferenceDialog.tsx:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useReferenceDialog.tsx)

This hook is used to open a side dialog that allows the selection
of entities under a given path.
You can use it in custom views for selecting entities.
You need to specify the path of the target collection at least.
If your collection is not defined in your  top collection configuration
(in your `FireCMS` component), you need to specify explicitly.
This is the same hook used internally when a reference property is defined.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### referenceDialogProps

`Omit`\<[`ReferenceSelectionInnerProps`](../interfaces/ReferenceSelectionInnerProps)\<`M`\>, `"path"`\> & `object`

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
