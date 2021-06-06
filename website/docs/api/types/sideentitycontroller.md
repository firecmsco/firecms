---
id: "sideentitycontroller"
title: "Type alias: SideEntityController<S>"
sidebar_label: "SideEntityController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SideEntityController**<S\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `close` | () => `void` | Close the last panel |
| `open` | (`props`: [SideEntityPanelProps](../interfaces/sideentitypanelprops.md) & `Partial`<[SchemaConfig](../interfaces/schemaconfig.md)\> & { `overrideSchemaResolver?`: `boolean`  }) => `void` | Open a new entity sideDialog. By default, the schema and configuration of the view is fetched from the collections you have specified in the navigation. At least you need to pass the collectionPath of the entity you would like to edit. You can set an entityId if you would like to edit and existing one (or a new one with that id). If you wish, you can also override the `SchemaSidePanelProps` and choose to override the CMSApp level SchemaResolver.  **`param`** |
| `sidePanels` | [SideEntityPanelProps](../interfaces/sideentitypanelprops.md)[] | List of side entity panels currently open |

#### Defined in

[contexts/SideEntityController.tsx:26](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/SideEntityController.tsx#L26)
