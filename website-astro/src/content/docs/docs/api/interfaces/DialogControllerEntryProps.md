---
slug: "docs/api/interfaces/DialogControllerEntryProps"
title: "DialogControllerEntryProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DialogControllerEntryProps

# Interface: DialogControllerEntryProps\<T\>

Defined in: [types/src/controllers/dialogs\_controller.tsx:25](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

Props used to open a side dialog

## Type Parameters

### T

`T` *extends* `object` = `object`

## Properties

### Component

> **Component**: `ComponentType`\<`object` & `T`\>

Defined in: [types/src/controllers/dialogs\_controller.tsx:31](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

The component type that will be rendered

***

### key

> **key**: `string`

Defined in: [types/src/controllers/dialogs\_controller.tsx:27](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

***

### props?

> `optional` **props**: `T`

Defined in: [types/src/controllers/dialogs\_controller.tsx:35](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

Props to pass to the dialog component
