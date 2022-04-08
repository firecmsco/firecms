---
id: "SideEntityController"
title: "Interface: SideEntityController"
sidebar_label: "SideEntityController"
sidebar_position: 0
custom_edit_url: null
---

Controller to open the side dialog displaying entity forms

## Properties

### sidePanels

• **sidePanels**: [`SideEntityPanelProps`](SideEntityPanelProps)<`any`, `any`\>[]

List of side entity panels currently open

#### Defined in

[models/side_entity_controller.tsx:80](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L80)

## Methods

### close

▸ **close**(): `void`

Close the last panel

#### Returns

`void`

#### Defined in

[models/side_entity_controller.tsx:75](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L75)

___

### open

▸ **open**(`props`): `void`

Open a new entity sideDialog. By default, the schema and configuration
of the view is fetched from the collections you have specified in the
navigation.
At least you need to pass the path of the entity you would like
to edit. You can set an entityId if you would like to edit and existing one
(or a new one with that id).
If you wish, you can also override the `SchemaConfig` and choose
to override the FireCMS level `SchemaRegistryController`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SideEntityPanelProps`](SideEntityPanelProps)<`any`, `any`\> |

#### Returns

`void`

#### Defined in

[models/side_entity_controller.tsx:93](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L93)
