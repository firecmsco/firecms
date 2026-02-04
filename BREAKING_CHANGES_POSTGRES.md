## BREAKING CHANGES IN POSTGRES IMPLEMENTATION

- For properties, `dataType` has been renamed to `type`.
  - `enumValues` has been renamed to `enum`.
  - `initalSort` has been renamed to `sort`.
  - `initialFilter` has been renamed to `filter`.

- Hooks:
  - `useReferenceDialog` is not called `useEntitySelectionDialog`

- Types can be now imported from `@firecms/types`