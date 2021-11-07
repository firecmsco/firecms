---
id: changelog
title: Changelog
---
## [1.0.0-beta3] - 2021-10-07
### Changed
- `EntityCollectionTable` has been renamed to `EntityCollectionView`

## [1.0.0-beta2] - 2021-10-07
### Changed
- When copying an entity the permission used is `create` now, instead of `edit`.
- Fix for entities not being saved when new or copy was clicked
- Fix for multiple delete keeping old state.
- Fix multiple form styles.
- Fix for array of number enums.

### Added
Added `hidden` configuration to disabled fields:
```tsx
buildProperty({
    dataType: "string",
    title: "Hidden field",
    disabled: {
        hidden: true
    }
})
```

## [1.0.0-beta1] - 2021-10-01

Many **breaking changes** in this version unfortunately, but it's for the
better!
We have done a lot of internal refactorings with the primary goal of making
internal and external APIs more predictable and consistent.

You can find a list of all the changes and help
in [Migrating from alpha versions](https://firecms.co/docs/migrating_from_alpha_versions)

## [0.50.0] - 2021-08-15

### Changed

- Added post process to storage metadata. @zhigang1992 thanks!
- Disabling add button on disabled array properties

## [0.49.1] - 2021-08-15

### Changed

- Fix for broken custom entity views and new entities.

## [0.49.0] - 2021-08-13

### Changed

[BREAKING] Big types refactor. **This only affects you if you use Typescript.**

All the key signatures affecting schemas (`EntitySchema` and related) have
changed from `EntitySchema<Key extends string = string>`
to `EntitySchema<M>` where `M` is simply your model, though you can omit it.

You are now encouraged to define your model like:

```tsx
type Product = {
    name: string;
    price: number;
}
const productSchema = buildSchema<Product>({
    // ...
    properties: {
        name: {
            dataType: "string",
            // ...
        },
        // ...
    }
    // ...
});
```

If you would still like to use inferred types from schemas using something like
`typeof productSchema`, you can still do it if you wrap it in a new type
`InferSchemaType`, but this is not encouraged. In the previous
example `InferSchemaType<typeOf productSchema>` is the same type as `Product`.

Related changes:

- Wherever you had defined your own schema, using `buildSchema()`
  and where using that as a type parameter, it can be changed to the defined
  type or just removed.
- `buildSchemaFrom` has been deleted since now it's identical to `buildSchema`

If you need more info: https://firecms.co/blog/types_refactor

## [0.48.0] - 2021-08-13

### Changed

- Fix for changes in forms not updating correctly when a real time update
  happened in Firestore
- Fix for popup view position
- Fix for popup view validating only the corresponding cell and not the whole
  property, which was provoking unfixable saving errors.

## [0.47.0] - 2021-08-10

### Changed

- [BREAKING] `EntityCustomViewBuilder` has been renamed to `EntityCustomView`
- Big form performance enhancements
- Fixes related to `oneOf` array properties.
- Fixed missing permission error in cell
- Added `collectionPath` to `PropertyBuilder`

## [0.46.0] - 2021-08-02

### Added

- `collectionPath` and `context` to `ExtraActionsParams`
- Green border indicator on collection tables to indicate that the value was
  saved successfully in Firestore.

## [0.45.0] - 2021-07-19

### Added

- New `oneOf` field in `ArrayProperty`. This new configuration allows the user
  to build complex array of objects structures, where the object is determined
  by a discriminator or `type` field and stored in the `value` field (both those
  fields are customizable). You can se an example of this in the content
  of [blog entries in the demo](https://demo.firecms.co/c/blog)
- You can now add custom views to your entity schemas, that get rendered next to
  the entity form. You can use these views for anything you need, such as
  rendering a custom form, building a dashboard or displaying a post preview.
- The `collectionPath` and app `context` props have been added
  to `PermissionBuilder` so you can get better info of the context of an entity.

### Changed

- Subcollection views and new schema custom views are now displayed side by side
  when you open the tabs in the side view (useful for better context switching)
- The markdown component has been replaced by a better one.
- Many bugfixes in the form popup view and enhanced behaviour. You can now keep
  a popup open and continue editing other fields. The popup doesn't close
  automatically now when you click on a different cell.

## [0.44.0] - 2021-07-19

### Changed

- [BREAKING] renamed `useAuthContext` to `useAuthController`
- Including `authController` in `PermissionBuilder` so you can access additional
  data for a user.
- Improved sample code and quickstart to include custom user logic

## [0.43.0] - 2021-07-06

### Changed

- Filtering in collections has been changed from a single dropdown to dropdowns
  in each column header.
- Added Timestamp filters
- `filterableProperties` has no longer effect since every field is filterable
  now and will be removed in the future.

### Added

- `indexes` property where you can specify the indexes in your Firestore
  configuration. That allows to filter/sort by multiple properties.

## [0.42.0] - 2021-06-22

### Changed

- Big internal refactor to have a better modularised code, also to generate
  better docs
- [BREAKING] EntityCollectionView (previously renamed to EntityCollection)
  has been removed. Simply rename to EntityCollection

## [0.41.1] - 2021-06-22

### Changed

- Fix for export component that was fetching the complete collections on mount.
  Now opening the CMS does not trigger excessive reads by default.

## [0.41.0] - 2021-06-19

### Changed

- Internal type fixes.
- [BREAKING] `ArrayProperty` first generic type changed from T to T[]
- [BREAKING] `CMSFormField` component (used for generating custom fields)
  has been replaced by a function called `buildPropertyField` that takes the
  same props
- Fix for jumping search bar while loading

## [0.40.0] - 2021-06-06

### Changed

- [BREAKING] Change EntityStatus from JS enum to TS type. This only affects you
  if you are using a save callback.
- [BREAKING] AlgoliaTextSearchDelegate is now a function instead of a class. You
  instantiate it the same, just remove the new keyword

## [0.39.1] - 2021-05-23

### Added

- Added `extra` and `setExtra` fields in `authController` to store custom user
  data.

### Changed

- Fix for home page
- Minor layout updates
- Removed `authResult` from auth context since it was actually useless and
  confusing

## [0.39.0] - 2021-05-13

### Added

- Allowing adding customized columns to CSV exports
- Added builder
- Allowing changing pagination size
- Allowing multiple paths per CMSView and `hideFromNavigation` flag added

### Changed

- [BREAKING] Material dependencies have been moved to `peerDependencies`
  If your build breaks, simply add these dependencies to your project:

```
"@mui/material": "^4.11.4",
"@mui/icons-material": "^4.11.2",
"@mui/lab": "^4.0.0-alpha.58",
"@material-ui/pickers": "^3.3.10",
```

## [0.38.2] - 2021-05-05

### Changed

- Custom id values are now trimmed
- Fix for entity actions dropdown
- Fix for being able to use side entity dialogs without having a rendered main
  view
- [BREAKING] If you are using provider and main view, you need to move the theme
  related fields from the main view to the provider (colors and fonts)

## [0.38.1] - 2021-05-03

### Changed

- Fix for unique in array validation and null values

## [0.38.0] - 2021-05-03

### Added

- New `uniqueInArray` validation prop. If you set it to `true`, the user will
  only be allowed to have the value of that property once in the parent
  `ArrayProperty`. It works on direct children properties or on first level
  children of a `MapProperty` (if set as the `.of` property of
  the `ArrayProperty`)

### Changed

- Fix for dates in new documents, being set to the current time
- The popup form field in the table now has a save button instead of saving
  automatically.

## [0.37.0] - 2021-04-29

### Changed

- Mono typeface import css has been removed from the core library and needs to
  be imported in every implementation now, like the Rubik typeface. Examples and
  Readme updated. Useful for SSR.
- Enhanced feedback for references configuration errors, no longer crashing the
  app.
- Changed double click behaviour in collections table to open the inline editor,
  replaced by a triple click. You can double click to select the content of the
  cell.

## [0.36.1] - 2021-04-29

### Changed

- Fix for navigation loading bug using NavigationBuilder

## [0.36.0] - 2021-04-29

### Changed

- `CMSApp` has been split internally into 3 components:
    - `CMSApp` which now is only in charge of initialising Firebase
    - `CMSAppProvider` which is in charge of providing all the contexts used by
      the CMS hooks.
    - `CMSMainView` which includes the views of the app including login screen
      and main collection and entity components. You can see an
      example [here](https://github.com/Camberi/firecms/blob/master/example/src/CustomCMSApp.tsx)
- Fix for a bug when saving entities.
- [BREAKING] `AuthContextController` has been renamed to `AuthController`

## [0.35.0] - 2021-04-26

### Added

- Added `useNavigationFrom` hook and `getNavigationFrom`
- Added `context` to save and delete callbacks, so you can
  access `getNavigationFrom`
  from within them.
- `NavigationBuilder` now supports returning a promise with the navigation
  result, useful if you need to check permissions based on the logged user.

### Changed

- [BREAKING] `SchemaSidePanelProps` has been renamed to `SchemaConfig` used in
  the `schemaResolver` prop.
- [BREAKING] `useAppConfigContext` has been renamed to `useCMSAppContext`

## [0.34.1] - 2021-04-07

### Changed

- Fix for broken collection detail buttons

## [0.34.0] - 2021-04-07

### Added

- Added unique fields validation
- Internal refactor of CollectionTable.tsx to improve its reusability

## [0.33.0] - 2021-03-30

### Added

- Added example shaped array custom fields in the `example` folder

### Changed

- Adaptations to make it easier to implement custom fields and use the internal
  CMS fields bound to properties.
- [BREAKING] `fieldProps` in the property fields configuration has been renamed
  to `customProps`
- [BREAKING] `customPreview` in the property fields configuration has been
  renamed to `preview`
- You don't need to specify an `of` props in array properties or a `properties`
  prop in map properties, if you specify a custom field

## [0.32.0] - 2021-03-30

### Added

- Allowing customizing enum chip colors. You can now specify the color key to
  the `EnumValueConfig`. You can also pass a `Map` instead of a plain object if
  you need to ensure the order of the elements.

### Changed

- Fix for Firebase peer dependency.
- [BREAKING] `EnumValues` is no longer generic.

## [0.31.0] - 2021-03-26

### Added

- Added callback for selecting file name when uploading files to an entity.

## [0.30.0] - 2021-03-16

### Added

- Improved permissions system. You can now set `create`, `edit` or `delete`
  permissions in the collection config. Those permissions can be set on a per
  user basis, using a builder.
- In the same way, you can now change the main navigation based on the logged
  user.

### Changed

- The `navigation` prop in `CMSApp` now can take an object where you define your
  collections like until now, but also the custom views that were found in the
  root level.
- [BREAKING] `AdditionalView` is now called `CMSView`
- [BREAKING] `customViews` in the main`CMSAppProps` has been moved under the new
  navigation object.
- [BREAKING] `deleteEnabled` and `editEnabled` have been removed from
  collections in favor of new `permissions` object.

## [0.29.0] - 2021-03-12

### Added

- Home page and possibility to add descriptions to collections using Markdown
- Allowing overriding locale (only used for changing date formats for now)
- Allowing customizing date formats with the parameter `dateTimeFormat`

## [0.28.2] - 2021-03-04

### Changed

- Fix for https://github.com/Camberi/firecms/issues/59
  (Algolia missing properties)
- Added ids to export

## [0.28.1] - 2021-03-05

### Changed

- Bigger drawer.
- Fix for schema resolving issue.
- Fix for react-router routes, they need to be exact now

## [0.28.0] - 2021-03-02

### Added

- Added export function in collection views, enabled by default but can be
  disabled.

### Changed

- Enhanced table performance by reducing the number of divs

## [0.27.0] - 2021-02-22

### Added

- Added `clearMissingValues` to map property config, allowing missing properties
  from field values to be deleted from Firestore.
- Added assigned size to custom previews.

## [0.26.2] - 2021-02-22

### Added

- MUI `disableEnforceFocus` is now enabled for entity dialogs

### Changed

- Enhanced disabled fields in table mode

## [0.26.1] - 2021-02-20

### Added

- Changed behavior of custom fields in table mode

## [0.26.0] - 2021-02-18

### Added

- You can now change entity properties on the fly, allowing for conditional
  fields, by using a builder that receives the current values.

### Changed

- The `disabled` flag has changed behavior. It now renders the corresponding
  field as disabled, instead of a preview. You can use the new flag `readOnly`
  to preserve the previous state
- Fix for empty strings on hooks and default values were causing a crash.
- Fix for additional column keys when defining collections.
- [BREAKING] `CMSFieldProps` is now called `FieldProps`
- [BREAKING] `FormFieldProps` is now called `CMSFormFieldProps`
- [BREAKING] `createFormField` is no longer passed as an argument
  in `CMSFieldProps`
  and it has been replaced with a `CMSFormField`, that is a React component that
  takes the same props. You most probably don't need this unless you are
  building nested custom fields.

## [0.25.2] - 2021-02-14

### Changed

- Fixed bug when switching subcollections in entity view.
- Fix for drag and drop arrays

## [0.25.1] - 2021-02-14

### Added

- `schemaResolver` props in the CMSApp level that allows overriding schemas and
  configs in the side dialog panels

## [0.25.0] - 2021-02-10

### Added

- `useSideEntityController` hook, allows to open the side dialog
  programmatically and override the entity schemas.
- New custom field for **arrays of references**, in form and table mode
- `initialSort` to collections views.

### Changed

- Removed full size entity view, in favor of side lateral menu. Also when typing
  directly URLs pointing to entities.
- Fix for form validation of untouched new entities.

## [0.24.0] - 2021-01-26

### Added

- Implemented FirebaseUi to allow for all possible Firebase login types.
- Added a `context` object in the `CMSFieldProps` that allows developers to
  access the context of the form, such as other field values. This is useful for
  creating conditional fields.
- Fix for buttons in rows of tables with no inline editing.

### Changed

- [BREAKING] The developer defined props in custom fields can be accessed now
  under the `customProps` property, instead of directly.

## [0.23.0] - 2021-01-23

### Added

- Users are able to select entities now
- Developers can now define custom actions in the collections, using a builder.
- Possibility to copy existing entities
- Two internal contexts are now exposed in the library: `useSnackbarController`
  and `useAuthContext`. More details in the README file
- Thanks to @faizaand and @Snivik for the PRs!

## [0.22.0] - 2021-01-02

### Added

- `onFirebaseInit` callback on the CMSApp called after Firebase initialisation.
  Useful for using the local emulator.

### Changed

- Fixed initial values bug when creating new entities and validation.
- Added `showError` prop to CMSFieldProps

## [0.21.2] - 2020-12-30

### Changed

- Fixed click behaviour of tables when inline editing is disabled.
- More consistent map property previews

## [0.21.1] - 2020-12-29

### Changed

- Table performance improvements

## [0.21.0] - 2020-12-28

### Added

- Inline editing of tables. Tables are now editable by default. There are two
  new parameters you can set in entity collection views.
    - `editEnabled` defaults to true. If false, the users will not be able to
      edit or create new entities.
    - `inlineEditing` defaults to true. If false, the users can still edit the
      content, but the inline editing is disabled. The side panel is still
      enabled.

### Changed

- [BREAKING] The custom fields API has been refactored and simplified. The
  Formik props have been abstracted away and only the relevant fields are
  exposed. You can find the new
  props [here](https://github.com/Camberi/firecms/blob/master/src/form/form_props.tsx)
  an example of the new implementation
  [here](https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx)
- Fixed date autovalues generating modified form prompt, even if it wasn't

## [0.20.0] - 2020-12-15

### Changed

- Internal refactor of CMSApp.tsx and contexts.
- [BREAKING] String properties config multiline value can no longer take a
  number and only accepts boolean values. Numbers used to be used to indicate
  the number of rows but TextField now grow automatically based on the content.
- Refactor of PreviewComponent to display better error messages when values are
  of an unexpected type.
- Dependencies update and cleanup.

## [0.19.0] - 2020-12-03

### Changed

- Added grouping and breadcrumbs to additional views and redesign.

## [0.18.1] - 2020-12-02

### Changed

- Array of enums fix when the value coming from Firestore is not an array
- A cosmetic fix for enum chips.
- Added deleted entity on delete hook

## [0.18.0] - 2020-11-30

### Changed

- [BREAKING] The deletion hook has been moved from the collection view to the
  entity schema.

## [0.17.2] - 2020-11-26

### Changed

- Fixed error when saving new entities

## [0.17.1] - 2020-11-23

### Changed

- Minor side navigation fix

## [0.17.0] - 2020-11-23

### Added

- Side navigation now stacks subcollections

## [0.16.6] - 2020-11-21

### Changed

- Fix for bug that was causing values not mapped as properties not to be saved.
- Internal refactor of preview properties
- Changed API for saveEntity

## [0.16.5] - 2020-11-20

### Changed

- Fix for composite reference paths such as "sites/en/product" References
  pointing to collection with a composite path were failing to locate the proper
  collection

## [0.16.4] - 2020-11-17

### Added

- Reference fields now include the reference key
- You can now filter array properties

### Changed

- Fix for initializing values to null, was colliding with enum validation.
- If you specify both a firebase config and are running in Firebase hosting, the
  specified config has now priority over the one found in the environment.

## [0.16.3] - 2020-11-13

### Added

- Allowing grouping of main navigation entries

## [0.16.2] - 2020-11-12

### Added

- Drag and drop reordering for storage fields
- `group` field in root navigation entries allow to group items into
  subcategories.

### Changed

- Adaptive wider size to subcollections seen in the entity side menu, which
  allows for a better layout of the table.
- Collection cells fade out if overflowed, instead of allowing scrolling

## [0.16.0] - 2020-11-10

### Added

- Auto values for timestamps. You can now set the `autoValue` property to
  timestamps to update the date to the current one either `on_create` (only when
  the entity is created) or `on_update` (every time it is saved)
- Markdown field with preview for string properties. Set the flag `markdown` to
  true in the CMS field config.
- Drag and drop feature for default arrays, allowing reorder

### Changed

- Reference field do not need to provide a schema or filter or search delegate
  of the target collection. All these properties are inferred from the
  collection path and the corresponding collection view. So setting an absolute
  path such as
  `products` will look into that path and find the corresponding view.

## [0.15.0] - 2020-11-02

### Added

- The lateral menu now is open on close based on the main navigation and has
  specific urls.
- You can now add a custom view to the main AppBar

### Changed

- Clicking on an entity in a collection now opens a lateral menu with an
  editable form instead of a preview.

## [0.14.3] - 2020-10-30

### Added

- Dropdown in entity collections to change row height. Added `defaultSize` to
  config.

### Changed

- Removed `small` property in collections in favor of `defaultSize`.

## [0.14.2] - 2020-10-27

### Added

- `columnWidth` field in properties to indicate the width of columns

### Changed

- Fix for wrong subcollections url.

## [0.14.0] - 2020-10-25

### Added

- Lateral panel for having entities info in context
- Revamped collection table for allow infinite scrolling and enhanced
  performance

### Changed

- Big general redesign
- Changed the layout of forms to single column. Removed `forceFullWidth` flag in
  properties.
- Renamed `urlMediaType` to `url` in the string property configuration.

[here]: https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx
