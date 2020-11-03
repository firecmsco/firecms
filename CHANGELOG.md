# Change Log

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
