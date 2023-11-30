---
id: "EntityReference"
title: "Class: EntityReference"
sidebar_label: "EntityReference"
sidebar_position: 0
custom_edit_url: null
---

Class used to create a reference to an entity in a different path

## Constructors

### constructor

• **new EntityReference**(`id`, `path`): [`EntityReference`](EntityReference.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `path` | `string` |

#### Returns

[`EntityReference`](EntityReference.md)

#### Defined in

[packages/firecms_core/src/types/entities.ts:51](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L51)

## Properties

### id

• `Readonly` **id**: `string`

ID of the entity

#### Defined in

[packages/firecms_core/src/types/entities.ts:44](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L44)

___

### path

• `Readonly` **path**: `string`

A string representing the path of the referenced document (relative
to the root of the database).

#### Defined in

[packages/firecms_core/src/types/entities.ts:49](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L49)

## Accessors

### pathWithId

• `get` **pathWithId**(): `string`

#### Returns

`string`

#### Defined in

[packages/firecms_core/src/types/entities.ts:56](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L56)
