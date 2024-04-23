---
id: changelog
title: Changelog
---
## [3.0.0-beta.6] - 2024-04-23

- Added AppCheck to every FireCMS variant.
- Various fixes for datasource delegate.
- Fix in saving cleaned data.
- Cloud new user roles creation issue fixed.
- Error message display issue in table cells fixed.
- Subcollections updating issue fixed.
- Import/export analytics and related data mapping conversions updated.
- Updated and improved handling of user roles and permissions.
- Enhanced the handling of service account files and project creation using SA.
- Updated the behavior of unindexed queries.
- User management connection to demo removed.
- Dependency updates to mitigate security issues.
- Exposing additional methods from data inference for better customization.
- Pro template updates for improved UI/UX.
- Updated documentation for collections and user management.

## [3.0.0-beta.5] - 2024-04-01

- [BREAKING] The main component for FireCMS Cloud has been renamed from `FireCMSApp` to `FireCMSCloudApp`. Please update
  your imports accordingly.
- Fixes related to the CLI. You can now install the CLI globally with `npm install -g @firecms/cli`.

## [3.0.0-beta.4] - 2024-03-27

- [BREAKING] The package name for FireCMS Cloud has changed from `firecms` to `@firecms/cloud`. This is done
  to avoid conflicts with the main FireCMS package. If you are using FireCMS Cloud, you will need to update your
  imports.
- [BREAKING] If you are importing the tailwind configuration, you can now find the import at:
  `import fireCMSConfig from "@firecms/ui/tailwind.config.js";`
- [BREAKING] In that case, you also need to add `@tailwindcss/typography` to your dev dependencies.
- [BREAKING] You need to update your `vite.config.js` and replace the package name in the federated configuration:
    ```javascript
    import { defineConfig } from "vite"
    import react from "@vitejs/plugin-react"
    import federation from "@originjs/vite-plugin-federation"
    
    // https://vitejs.dev/config/
    export default defineConfig({
        esbuild: {
            logOverride: { "this-is-undefined-in-esm": "silent" }
        },
        plugins: [
            react(),
            federation({
                name: "remote_app",
                filename: "remoteEntry.js",
                exposes: {
                    "./config": "./src/index"
                },
                shared: ["react", "react-dom", "@firecms/cloud", "@firecms/core", "@firecms/firebase", "@firecms/ui"]
            })
        ],
        build: {
            modulePreload: false,
            target: "esnext",
            cssCodeSplit: false,
        }
    })
    ```
- Minor performance improvements and bug fixes.
- Enhanced filtering and sorting capability for indexed fields.
- Extended StorageSource to support custom `bucketUrl`.
- Cleanup for navigation controller generics and Markdown prose classes.
- Addressed User Management saving issues and renamed Cloud template.
- Fixed ReferenceWidget.tsx rerenders.
- Fixed homepage new collection button issue.
- Fixed CLI templates path.
- Roles integrated into AuthController.
- Small change to plugins API.
- Added user details to navigation bar dropdown.
- Dependencies updated.
- Entity view preview and title refactor.
- Kanban board work in progress.
- Fix for new radix empty select values.
- Fixes for undefined properties in arrays and editor.
- Additional parameters added in auth controllers.
- Navigation cards refactor and Plugin API cleanup.
- Fix for importing data with non-string IDs.
- Documentation: Added recipe for managing entity callbacks.
- Web updates and CLI fix for yarn.

## [3.0.0-beta.3] - 2024-02-21

- Fix for importing data in subcollections.
- Code reordering.
- Removed minification. Changed EntityReference type checks.
- Editor image upload updates.
- Cosmetic.
- Moved tailwind.config.js editor plugin.
- Removed callbacks in side navigation views, prevents bug.
- PRO template fix.
- PRO Login view cleanup.

## [3.0.0-beta.2] - 2024-02-21

- Added Formex package to handle forms across the platform. Formex is an in-house
  form management library with a similar API to Formik, but with better performance,
  and much more lightweight.
- Enhanced onboarding process for new users.
- Fixed data import issues for new collections.
- Tweaked SaaS onboarding for better user experience.
- Implemented regexp validation for input fields.
- Improved login error feedback.
- Extracted navigation controller for better manageability.
- Updated styles for consistency.
- Updated Vite and dependencies for performance and security.
- Refactored user and role forms to use Formex.
- Fixed table header forms and collection editor issues.
- Addressed incorrect JSON import problems.
- Removed Formik, enhancing form management with Formex.
- Made minor HTML nesting and debounce fixes.
- Fixed array container menu and multiline input bugs.
- Migrated Tailwind configuration to lib for easier management.
- Adjusted Sentry configuration for error reporting.
- Fix for subcollections edit view showing empty.
- Fixes for block and group properties in editor saving multiple entries when editing an existing sub property.

## [3.0.0-beta.1] - 2024-02-01

The first beta release of FireCMS v3.0.0.
Check all the new features and improvements in the [documentation](./docs/what_is_new_v3)
and the [migration guide](./docs/migrating_from_v2).

## [2.2.0] - 2023-11-09

- Fix for missing subcollection links.
- New email and password login flow
- Removed add button in collection group
- Export fixes
- Fix for collections search

## [2.1.0] - 2023-09-12

- [BREAKING] The logic to verify valid filter combinations has been moved to the `DataSource` interface.
  This improves the ability to customize the data source and allows for more complex filters.
  This change will only affect you if you have implemented a custom data source. You will need to
  add a `isFilterCombinationValid` method to your data source.
- [BREAKING] The prop `filterCombinations` has been removed from the `EntityCollection` component.
  This is now handled by the data source. If you need to allow multiple filters, you can use the
  new `FireStoreIndexesBuilder` callback. Check
  the [documentation](https://firecms.co/docs/collections/multiple_filters)
  for more information.
- You can now use nested `spreadChildren` in map properties, allowing to show arbitrary
  nested structures as single columns in the collection view.
- The collection count value is now updated with filters applied.
- Fix for csv export not working when underlying data is invalid.
- Fix for bug of collection search returning a single result.
- Fix for reference fields breaking with incorrect values.

## [2.0.5] - 2023-07-11

- Default value for string properties is now `null` instead of `""`.
- Fix for changing text search controller not updating as a dependency.
- Fix for setting a unique field using a reference, which was
  generating an invalid query in Firestore.

## [2.0.4] - 2023-06-15

- Fix for `forceFilter` not being applied correctly in reference views.
- Fix for nullable enum validation config.

## [2.0.3] - 2023-06-15

- Fix for form resetting values when saving.

## [2.0.2] - 2023-06-14

- Replaced `flexsearch` with `js-search`. Their imports are too messed up.
- Fix for form assigning wrong ids
-

## [2.0.1] - 2023-06-12

- Fix for block entries not generating the correct default value when adding a new entry. This was causing
  a bug when the child property is an array, like in the blog example.
- Added the `formAutoSave` to collections. This removes the buttons from the form and automatically saves
  the entity when there are changes or the user leaves the form.
- You can now access the `formContext` from collection views, allowing you to access the current entity
  being edited, modify values and `save`.

## [2.0.0] - 2023-06-07

- You can use a callback to define the default view of an entity now.
- Fix when opening entities from a custom view, that also uses subcollections.

## [2.0.0-rc.2] - 2023-06-05

- `@mui/x-date-pickers` dependency reverted to `^5.0.0`
- Assigned default values to every property now, based on the property type.
  e.g. boolean properties will have a default value of `false`, maps to `{}`,
  and most other properties to `null`.
- Removed empty space for hidden properties in the entity side dialog.

## [2.0.0-rc.1] - 2023-05-31

- Added arbitrary key-value fields with the prop `keyValue` in map properties
- `@mui/x-date-pickers` dependency updated (you may need to bump your version
  to 6.5.0)
- Some enhancements to the `EntityCollectionTable` component, referring to
  values being updated in the background. Also correct debouncing for
  table fields.

## [2.0.0-beta.7] - 2023-05-23

- Added support for collection groups
- [BREAKING] The `countEntities` function in the data source now takes an
  object instead of a string as parameter. This will only affect you if you
  have built a custom component using that function.
- Added string url previews to fields
- Fix for geopoints not being serialized correctly when saving.

## [2.0.0-beta.6] - 2023-05-11

- Fix for Typescript types not being exported correctly and giving errors
  when using the library with the quickstart.
- Fix for error messages not showing up correctly in new text inputs.
- Fix for flexsearch import causing crash using webpack

## [2.0.0-beta.5] - 2023-04-28

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
