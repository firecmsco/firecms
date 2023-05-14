---
id: changelog
title: Changelog
---
## [WIP 2.0.0-beta.6] - 2023-05-11

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
