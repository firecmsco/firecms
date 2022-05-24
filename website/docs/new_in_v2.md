---
id: new_in_v2
title: New and updated features in version 2.0
---

:::important 
FireCMS 2.0 is in alpha and the changes proposed here may break or
not be relevant in future iterations
:::

So after than more than 2 years of development of version 1.0 and after taking 
all your numerous feedback and contributions we are launching the alpha phase
of version 2.0.

We will use this document to list all the changes and new features included in 
this version:

- Entity schemas have been removed and merged with collections, in order
to simplify code since they felt redundant.
- More consistent naming all through the app.
- Better documentation.
- Date properties: you can now select between date or date/time modes.
- Entity side dialogs now open the first tab by default, in order to save
some clicks.
- You can spread MapProperty fields in a collection using the `spreadChildren`
prop.
- You can now assign icons to collections and custom views.
- Storage fields have been simplified and now the preview type can be 
inferred from the uploaded file.
- When creating a new entity, the id gets assigned as the first step. This
allows to be able to use the internal callbacks of properties that depend on 
the id of the new entity, such as file upload paths or file names.
- Enums can be defined now as arrays of objects with multiple configuration
options such as the color of the tag.
- Visual and performance refactor of forms, especially in order to support
complex nested structures of array and map properties.
- It should be easier now to create your own custom fields and to reuse the 
internal fields of the CMS, which have been renamed and are now exported as:
  - `ArrayCustomShapedFieldBinding`
  - `ArrayEnumSelectBinding`
  - `ArrayOfReferencesFieldBinding`
  - `BlockFieldBinding`
  - `DateTimeFieldBinding`
  - `MapFieldBinding`
  - `MarkdownFieldBinding`
  - `ReadOnlyFieldBinding`
  - `ReferenceFieldBinding`
  - `RepeatFieldBinding`
  - `SelectFieldBinding`
  - `StorageUploadFieldBinding`
  - `SwitchFieldBinding`
  - `TextFieldBinding`
