---
id: new_in_v2
title: New and updated features in version 2.0
---

:::important
The package name has changed from `@Camberi/firecms` to `firecms`.
Please update your dependencies accordingly
:::

After than more than 2 years of development of version 1.0 and after taking
all your numerous feedback and contributions we are launching version 2.0.

We will use this document to list all the changes and new features included in
this version:

### General

- **New CLI tool** to create new FireCMS projects `yarn create firecms-app --v2`.
- New OpenAI integration.
- More consistent **naming** all through the app.
- Better documentation.
- Visual and performance refactor of **forms**, especially in order to support
  complex nested structures of array and map properties.
- In order to improve customization, you can now define your own components for
  some key parts of the library. For example, you may want to add actions to
  every `EntityCollectionView` in your instance, so you can create your
  component wrapping `EntityCollectionView` and setting is as the default. Or
  add your terms and conditions checkbox to the login screen.
- Reference dialogs are now opened using the side dialog, and you can create new
  entities directly from the reference selection view.
- `AuthDelegate` and `AuthController` have been merged into `AuthController`
  which now serves both previous purposes.
- You can now define a specific logo for dark mode.
- If you are using `FireCMS` instead of `FirebaseAppCMS`:
  - You need to add an additional `SnackbarProvider` and a `ModeControllerProvider` 
  in your tree.
  It was provided by `FireCMS` before, but we treat it as a separate component 
  now for better customization.
- In the collection view, text inputs now save the values onBlur instead of
  onChange, or after pressing enter. This is to avoid saving the value on every
  keystroke, which can be annoying for the user.
- Enabled Firebase App Check.
- Revamped home screen with collection search and favorites.
- Added `autoOpenDrawer` prop, allowing to open the drawer automatically when
  hovering the menu.

### Collections and schemas

- Added support for collection groups.
- There is a completely new `VirtualTable` component used internally,
  replacing `react-base-table`. We have implemented it from scratch to suit our
  needs and have seen a massive increase in **performance**.
- You can now have multiple collections at the same path, thanks to the
  introduction of **aliases**.
- **Entity schemas have been removed** and merged with collections, in order to
  simplify code since they felt redundant.
- Entity side dialogs now open the first tab by default, in order to save some
  clicks. Also, they don't close after saving, allowing users to do further
  modifications, or add entities to sub-collections.
- You can now assign **icons** to collections and custom views.
- When creating a new entity, the id gets assigned as the first step. This
  allows developers to use the internal callbacks of properties that depend on
  the id of the new entity, such as file upload paths or file names.
- New entity callbacks:
  - `onFetch` you can use this callback if you need to modify data after it is 
  read from the data source.
  - `onIdUpdate` you can use this callback to modify the id based on other
  values

### Properties and builders

- New text fields components give us better performance and more flexibility.
- **Property builders**: You can now have property builders at any level of your
  property tree (not just in the first level like in version 1.0). You also get
  the local value of the property you are defining in the callback, which
  simplifies the process of building complex properties that depend on other
  values or themselves.
- You can spread `MapProperty` fields in a collection using the `spreadChildren`
  prop.
- You can now use the `keyValue` props in `MapProperty` to define the key and
  value properties of the map. This is useful if you need to input arbitrary
  data.
- Date properties: you can now select between date or date/time modes.
- Enums can be defined now as arrays of objects with multiple configuration
  options such as the color of the tag.
- You can add a `clearable` prop to `StringProperty`, `NumberProperty` and `DateProperty` 
  to allow users to clear the value.
- Storage fields have been simplified and now the preview type can be inferred
  from the uploaded file.
- You can now totally customise the colors of enum chips.
- Totally new markdown field, with a preview and a full screen editor. It is
  not using `@uiw/react-markdown-editor` anymore, which was not SSR friendly.
- You are now able to change the value of a property within a different one.
- You can now copy the values of arrays.
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
