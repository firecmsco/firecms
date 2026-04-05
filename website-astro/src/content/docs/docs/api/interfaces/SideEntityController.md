---
slug: "docs/api/interfaces/SideEntityController"
title: "SideEntityController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SideEntityController

# Interface: SideEntityController

Defined in: [types/src/controllers/side\_entity\_controller.tsx:82](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_entity_controller.tsx)

Controller to open the side dialog displaying entity forms

## Properties

### close()

> **close**: () => `void`

Defined in: [types/src/controllers/side\_entity\_controller.tsx:86](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_entity_controller.tsx)

Close the last panel

#### Returns

`void`

***

### open()

> **open**: \<`M`\>(`props`) => `void`

Defined in: [types/src/controllers/side\_entity\_controller.tsx:97](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_entity_controller.tsx)

Open a new entity sideDialog. By default, the collection and configuration
of the view is fetched from the collections you have specified in the
navigation.
At least you need to pass the path of the entity you would like
to edit. You can set an entityId if you would like to edit and existing one
(or a new one with that id).

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`EntitySidePanelProps`](EntitySidePanelProps)\<`M`\>

#### Returns

`void`

***

### replace()

> **replace**: \<`M`\>(`props`) => `void`

Defined in: [types/src/controllers/side\_entity\_controller.tsx:103](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_entity_controller.tsx)

Replace the last open entity panel with the given one.

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### props

[`EntitySidePanelProps`](EntitySidePanelProps)\<`M`\>

#### Returns

`void`
