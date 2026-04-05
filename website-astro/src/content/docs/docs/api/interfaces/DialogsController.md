---
slug: "docs/api/interfaces/DialogsController"
title: "DialogsController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DialogsController

# Interface: DialogsController

Defined in: [types/src/controllers/dialogs\_controller.tsx:7](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

Controller to open the side dialog

## Properties

### close()

> **close**: () => `void`

Defined in: [types/src/controllers/dialogs\_controller.tsx:12](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

Close the last dialog

#### Returns

`void`

***

### open()

> **open**: \<`T`\>(`props`) => `object`

Defined in: [types/src/controllers/dialogs\_controller.tsx:18](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/dialogs_controller.tsx)

Open a dialog

#### Type Parameters

##### T

`T` *extends* `object` = `object`

#### Parameters

##### props

[`DialogControllerEntryProps`](DialogControllerEntryProps)\<`T`\>

#### Returns

`object`

##### closeDialog()

> **closeDialog**: () => `void`

###### Returns

`void`
