---
id: changelog
title: Changelog
---
## WIP - [2.0.0-beta.2] - 2023-01-18

### Changed
- Fixed bug where collection actions were getting their internal state reset.
- [BREAKING] Removed the prop `loadedEntities` from `CollectionActionsProps`. If
this prop was useful to you let us know, so we can look for alternative ways to
provide it.
- [BREAKING] In the component `EntityCollectionTable`, the prop `ActionsBuilder`
has been replaced with `actions`.
- Improved preview of files that are not images, videos, or audio files.
- Form optimizations
- Fix for reference dialog not clearing selection
- Internal refactoring of the `EntityCollectionTable` component.
- Fix for multiple error snackbar, when there is an error uploading a file.

## [2.0.0-beta.1] - 2023-01-18

This is the first beta release of FireCMS v2.0.0. 
While still in beta, we consider this version stable enough to be used in production.

> All changes related to V2 alpha are currently bundled in these documents:
> - [What's new in version 2.0.0](https://firecms.co/docs/new_in_v2)
> - [Migration guide from version 1.x to 2.0.0](https://firecms.co/docs/migrating_from_v1)

> The changelog for 1.0.0 versions and previous versions can be found [here](https://firecms.co/docs/1.0.0/changelog)
