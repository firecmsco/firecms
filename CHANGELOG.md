# Change Log

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
