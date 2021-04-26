# Change Log

## [0.35.0] - 2021-04-26

### Added
- Added `useNavigationFrom` hook and `getNavigationFrom`
- Added `context` to save and delete callbacks, so you can access `getNavigationFrom`
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
- [BREAKING] `fieldProps` in the property fields configuration has been
  renamed to `customProps`
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
  permissions in the collection config. Those permissions can be set on a per user
  basis, using a builder.
- In the same way, you can now change the main navigation based on the logged user.

### Changed
- The `navigation` prop in `CMSApp` now can take an object where you define your
  collections like until now, but also the custom views that were found in the
  root level.
- [BREAKING] `AdditionalView` is now called `CMSView`
- [BREAKING] `customViews` in the main`CMSAppProps` has been moved under the new
  navigation object.
- [BREAKING] `deleteEnabled` and `editEnabled` have been removed from collections
  in favor of new `permissions` object.

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
- Added `clearMissingValues` to map property config, allowing missing
  properties from field values to be deleted from Firestore.
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
- [BREAKING] `createFormField` is no longer passed as an argument in `CMSFieldProps`
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
- `useSideEntityController` hook, allows to open the side dialog programmatically
  and override the entity schemas.
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
- Inline editing of tables. Tables are now editable by default. There are two new
  parameters you can set in entity collection views.
  - `editEnabled` defaults to true. If false, the users will not be able to
  edit or create new entities.
  - `inlineEditing` defaults to true. If false, the users can still edit the
  content, but the inline editing is disabled. The side panel is still enabled.
### Changed
- [BREAKING] The custom fields API has been refactored and simplified. The Formik
  props have been abstracted away and only the relevant fields are exposed.
  You can find the new props [here](https://github.com/Camberi/firecms/blob/master/src/form/form_props.tsx) an example of the new implementation
  [here](https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx)
- Fixed date autovalues generating modified form prompt, even if it wasn't

## [0.20.0] - 2020-12-15
### Changed
- Internal refactor of CMSApp.tsx and contexts.
- [BREAKING] String properties config multiline value can no longer take a number
  and only accepts boolean values. Numbers used to be used to indicate the number
  of rows but TextField now grow automatically based on the content.
- Refactor of PreviewComponent to display better error messages when values
  are of an unexpected type.
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
  timestamps to update the date to the current one either `on_create` (only
  when the entity is created) or `on_update` (every time it is saved)
- Markdown field with preview for string properties. Set the flag `markdown` to
  true in the CMS field config.
- Drag and drop feature for default arrays, allowing reorder

### Changed
- Reference field do not need to provide a schema or filter or search delegate
  of the target collection. All these properties are inferred from the collection
  path and the corresponding collection view. So setting an absolute path such as
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
- Revamped collection table for allow infinite scrolling and enhanced performance

### Changed
- Big general redesign
- Changed the layout of forms to single column. Removed `forceFullWidth` flag in
  properties.
- Renamed `urlMediaType` to `url` in the string property configuration.


[here]: https://github.com/Camberi/firecms/blob/master/example/src/custom_field/CustomColorTextField.tsx
