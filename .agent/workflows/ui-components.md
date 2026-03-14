---
description: Rules for creating UI components in the Rebase codebase
---

## Visual Cohesion Rules

1. **Always use the `@rebasepro/ui` kit** for all UI components. Before creating any new component, check what is available in `packages/ui/src/components/`. Available components include:
   - `Card`, `Paper`, `Container`, `CenteredView`
   - `Typography`, `Markdown`
   - `Button`, `IconButton`, `LoadingButton`
   - `TextField`, `DebouncedTextField`, `TextareaAutosize`
   - `Select`, `MultiSelect`, `Autocomplete`
   - `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
   - `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
   - `Tabs`, `Chip`, `Badge`, `Label`, `InfoLabel`
   - `Checkbox`, `BooleanSwitch`, `RadioGroup`, `Slider`
   - `Menu`, `Menubar`, `MenuItem`, `Popover`, `Sheet`
   - `Tooltip`, `Skeleton`, `CircularProgress`, `Separator`
   - `Avatar`, `Alert`, `Collapse`, `ExpandablePanel`
   - `SearchBar`, `DateTimeField`, `ColorPicker`, `FileUpload`
   - Icons from `@rebasepro/ui` (e.g. `ArrowForwardIcon`, `AddIcon`, `DeleteIcon`, etc.)

2. **Never use `as any`** in TypeScript code. Use proper typing or explicit type narrowing instead.

3. **Follow existing patterns**: When building new views, look at how existing components like `NavigationCard`, `DefaultHomePage`, or `RolesView` structure their layouts using the UI kit.

4. **Use `cls()` from `@rebasepro/ui`** for conditional class merging instead of template literals.

5. **Use `Typography`** for all text rendering — never use raw `<h1>`, `<p>`, `<span>` for visible UI text.
