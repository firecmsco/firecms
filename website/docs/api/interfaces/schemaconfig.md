---
id: "schemaconfig"
title: "Interface: SchemaConfig"
sidebar_label: "SchemaConfig"
sidebar_position: 0
custom_edit_url: null
---

You can add these additional props to override properties in a SchemaResolver

## Properties

### permissions

• `Optional` **permissions**: [PermissionsBuilder](../types/permissionsbuilder.md)<any, any\>

Can the elements in this collection be added and edited.

#### Defined in

[models/schema_resolver.ts:11](https://github.com/Camberi/firecms/blob/42dd384/src/models/schema_resolver.ts#L11)

___

### schema

• **schema**: [EntitySchema](entityschema.md)<any, any\>

Schema representing the entities of this view

#### Defined in

[models/schema_resolver.ts:16](https://github.com/Camberi/firecms/blob/42dd384/src/models/schema_resolver.ts#L16)

___

### subcollections

• `Optional` **subcollections**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any, any\>, any, string\>[]

Following the Firestore document and collection schema, you can add
subcollections to your entity in the same way you define the root
collections.

#### Defined in

[models/schema_resolver.ts:23](https://github.com/Camberi/firecms/blob/42dd384/src/models/schema_resolver.ts#L23)
