---
id: changelog
title: Changelog
---
## [2.1.0] - 2023-09-12

### Changed

- [BREAKING] The logic to verify valid filter combinations has been moved to the `DataSource` interface.
  This improves the ability to customize the data source and allows for more complex filters.
  This change will only affect you if you have implemented a custom data source. You will need to 
  add a `isFilterCombinationValid` method to your data source.
- [BREAKING] The prop `filterCombinations` has been removed from the `EntityCollection` component.
  This is now handled by the data source. If you need to allow multiple filters, you can use the
  new `FireStoreIndexesBuilder` callback. Check the [documentation](https://firecms.co/docs/collections/multiple_filters)
  for more information.
- You can now use nested `spreadChildren` in map properties, allowing to show arbitrary
  nested structures as single columns in the collection view.
- The collection count value is now updated with filters applied.
- Fix for csv export not working when underlying data is invalid.
- Fix for bug of collection search returning a single result.
- Fix for reference fields breaking with incorrect values.

## [2.0.5] - 2023-07-11

### Changed

- Default value for string properties is now `null` instead of `""`.
- Fix for changing text search controller not updating as a dependency.
- Fix for setting a unique field using a reference, which was
  generating an invalid query in Firestore.

## [2.0.4] - 2023-06-15

### Changed

- Fix for `forceFilter` not being applied correctly in reference views.
- Fix for nullable enum validation config.

## [2.0.3] - 2023-06-15

### Changed

- Fix for form resetting values when saving.

## [2.0.2] - 2023-06-14

### Changed

- Replaced `flexsearch` with `js-search`. Their imports are too messed up.
- Fix for form assigning wrong ids
-

## [2.0.1] - 2023-06-12

### Changed

- Fix for block entries not generating the correct default value when adding a new entry. This was causing
  a bug when the child property is an array, like in the blog example.
- Added the `formAutoSave` to collections. This removes the buttons from the form and automatically saves
  the entity when there are changes or the user leaves the form.
- You can now access the `formContext` from collection views, allowing you to access the current entity
  being edited, modify values and `save`.

## [2.0.0] - 2023-06-07

### Changed

- You can use a callback to define the default view of an entity now.
- Fix when opening entities from a custom view, that also uses subcollections.

## [2.0.0-rc.2] - 2023-06-05

### Changed

- `@mui/x-date-pickers` dependency reverted to `^5.0.0`
- Assigned default values to every property now, based on the property type.
  e.g. boolean properties will have a default value of `false`, maps to `{}`,
  and most other properties to `null`.
- Removed empty space for hidden properties in the entity side dialog.

## [2.0.0-rc.1] - 2023-05-31

### Changed

- Added arbitrary key-value fields with the prop `keyValue` in map properties
- `@mui/x-date-pickers` dependency updated (you may need to bump your version
  to 6.5.0)
- Some enhancements to the `EntityCollectionTable` component, referring to
  values being updated in the background. Also correct debouncing for
  table fields.

## [2.0.0-beta.7] - 2023-05-23

### Changed

- Added support for collection groups
- [BREAKING] The `countEntities` function in the data source now takes an
  object instead of a string as parameter. This will only affect you if you
  have built a custom component using that function.
- Added string url previews to fields
- Fix for geopoints not being serialized correctly when saving.

## [2.0.0-beta.6] - 2023-05-11

### Changed

- Fix for Typescript types not being exported correctly and giving errors
  when using the library with the quickstart.
- Fix for error messages not showing up correctly in new text inputs.
- Fix for flexsearch import causing crash using webpack

## [2.0.0-beta.5] - 2023-04-28

### Changed

- Updated fields Look and Feel. Text fields are now custom, not the ones
  provided by Material UI. This allows for more customization, less code, and
  better performance.
- Fixed login view not centered
- Fixed popup field selection and drag and drop bug
- Fix for skip login field
- HTML now rendered correctly in markdown previews
- Fix for `read` permission not being applied correctly.
- Fix for not centered empty view state in collections

## [2.0.0-beta.4] - 2023-03-30

### Changed

- Fixed table header bug
- Added search bar in home page
- Added favourites and recent collections view in home page.
- Fix for some deeply nested property builders in arrays
- Added `autoOpenDrawer` prop, allowing to open the drawer automatically when
  hovering the menu.
- Allow choosing which custom view or subcollection is opened by default,
  with the `defaultSelectedView` prop. Thanks to @SeeringPhil for the PR!
- Renamed `builder` to `Builder` in collection custom views for consistency.

## [2.0.0-beta.3] - 2023-03-21

### Changed

- Fixed bug regarding custom selection controllers.
- Fix for default value not being set in array properties.
- Enabled Firebase App Check. Thanks to @sengerts for the PR!
- Added copy function to array views. Thanks to @guustmc for the PR!
- The entity side dialog is now wider by default.
- Small improvements to block properties. Now the first type is selected by
  default.
- Fixed additional ordering added when multiple filter applied, which created a
  bug.
  Thanks to @juanleondev for the PR!
- Renamed `ReferenceSelectionView` to `ReferenceSelectionInner`
- Added reference filters
- Fixed delay of table update when deleting an entity
- You can now change the value of any property within a custom field.

## [2.0.0-beta.2] - 2023-01-30

### Changed

- Fixed bug where collection actions were getting their internal state reset.
- Improved preview of files that are not images, videos, or audio files.
- Form optimizations
- Fix for reference dialog not clearing selection
- Fix for multiple error snackbar, when there is an error uploading a file.
- Fix for missing highlight when closing side dialog.
- Fix for delayed data update when changing filters.
- Internal refactoring of the `EntityCollectionTable` component.
- [BREAKING] In the component `EntityCollectionTable`, the prop `ActionsBuilder`
  has been replaced with `actions`.

## [2.0.0-beta.1] - 2023-01-18

This is the first beta release of FireCMS v2.0.0.
While still in beta, we consider this version stable enough to be used in
production.

> All changes related to V2 alpha are currently bundled in these documents:
> - [What's new in version 2.0.0](https://firecms.co/docs/new_in_v2)
> - [Migration guide from version 1.x to 2.0.0](https://firecms.co/docs/migrating_from_v1)

> The changelog for 1.0.0 versions and previous versions can be
> found [here](https://firecms.co/docs/1.0.0/changelog)
