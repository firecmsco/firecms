---
id: "SideEntityController"
title: "Interface: SideEntityController"
sidebar_label: "SideEntityController"
sidebar_position: 0
custom_edit_url: null
---

Controller to open the side dialog displaying entity forms

## Properties

### close

• **close**: () => `void`

#### Type declaration

▸ (): `void`

Close the last panel

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:78](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L78)

___

### open

• **open**: \<M\>(`props`: [`EntitySidePanelProps`](EntitySidePanelProps.md)\<`M`\>) => `void`

#### Type declaration

▸ \<`M`\>(`props`): `void`

Open a new entity sideDialog. By default, the collection and configuration
of the view is fetched from the collections you have specified in the
navigation.
At least you need to pass the path of the entity you would like
to edit. You can set an entityId if you would like to edit and existing one
(or a new one with that id).

##### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`EntitySidePanelProps`](EntitySidePanelProps.md)\<`M`\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:89](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L89)

___

### replace

• **replace**: \<M\>(`props`: [`EntitySidePanelProps`](EntitySidePanelProps.md)\<`M`\>) => `void`

#### Type declaration

▸ \<`M`\>(`props`): `void`

Replace the last open entity panel with the given one.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`EntitySidePanelProps`](EntitySidePanelProps.md)\<`M`\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_entity_controller.tsx:95](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_entity_controller.tsx#L95)
