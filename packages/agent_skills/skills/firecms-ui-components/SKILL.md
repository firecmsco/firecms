---
name: firecms-ui-components
description: The @firecms/ui component kit and its exact APIs. Use this skill whenever you write UI in a FireCMS project (a custom view, a custom field, a dialog, a dashboard, a login screen) or in any React app that uses @firecms/ui, before writing any markup.
---

# @firecms/ui: the FireCMS component kit

`@firecms/ui` is the component library FireCMS itself is built with: React, Tailwind CSS v4 and
Radix UI. Every screen of FireCMS, FireCMS PRO and FireCMS Cloud uses it, so a view built from
it looks like it belongs in the app, follows light and dark mode, and picks up the project's
theme colors.

This skill is the API reference. For how to compose those components into a page that looks
right (page width, headings, spacing, empty states, whole-view skeletons), read
**`firecms-design-language`** too.

## The rules

1. **Build from the kit.** Before writing a `<div>` with hand-made styles, look for the component
   below. Buttons, inputs, selects, dialogs, menus, tabs, tables, chips, alerts, tooltips,
   cards: they all exist.
2. **No other UI library.** Never add MUI, Chakra, Ant, shadcn copies, Headless UI, `lucide-react`,
   `react-icons`, or direct `@radix-ui/*` imports. FireCMS stopped using MUI in 3.0; MUI-style
   code (`sx`, `makeStyles`, `@mui/material`) does not belong here.
3. **Text goes through `Typography`.** Not raw `<h1>`, `<p>` or `<span>` with font classes.
4. **Use the theme tokens, not hex values or Tailwind's default palette for surfaces.** Backgrounds
   and borders use `surface-*` / `surface-accent-*` and the mixins (`paperMixin`,
   `defaultBorderMixin`); brand color is `primary` / `secondary`. No `style={{ color: "#..." }}`,
   no `bg-gray-100`, no `bg-white` without its `dark:` pair.
5. **Every color needs its dark variant.** FireCMS switches dark mode with `data-theme="dark"` on
   the root. If you write a background or text color class, write the `dark:` one next to it, or
   use a component or mixin that already does.
6. **Merge classes with `cls()`** (exported by the kit; `clsx` + `tailwind-merge`), never by
   string concatenation. `cn()` is deprecated.
7. **Icons are the kit's Material icons**: `AddIcon`, `DeleteIcon`, `SearchIcon`... (see Icons).

```tsx
import { Button, Typography, TextField, AddIcon, cls } from "@firecms/ui";
```

Everything is exported from the package root. There are no subpath imports to remember.

**FireCMS Cloud custom code** (a project whose code imports `@firecms/cloud`, like the
`template_cloud` scaffold) imports the same components from `@firecms/cloud`, which re-exports
all of `@firecms/ui` and `@firecms/core`: `import { Button, Typography } from "@firecms/cloud";`.
The code is loaded into app.firecms.co through Module Federation, so keep to the kit and the
`surface-*` tokens: classes the host stylesheet doesn't contain (for example `dark:bg-slate-900`)
can be missing at runtime.

## Setup (only outside a FireCMS app)

Inside a FireCMS project the kit is already installed and configured. In another React app with
Tailwind CSS v4, install `@firecms/ui` and set up the stylesheet like the FireCMS templates do:

```css
@import "tailwindcss";
@import "@firecms/ui/index.css" layer(base);
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@plugin "@tailwindcss/typography";

@source "./**/*.{js,ts,jsx,tsx}";
@source "../node_modules/@firecms/**/*.{js,ts,jsx,tsx}";

@theme {
    --color-primary: #0070f4;
    --color-secondary: #ff5b79;
}
```

The `@source` line for `node_modules/@firecms` matters: without it Tailwind never sees the classes
the components use and they render unstyled. Older docs show a Tailwind v3
`tailwind.config.js` preset; current FireCMS uses the v4 CSS setup above.

## Theme tokens

Defined in `@firecms/ui/index.css` (`@theme`). Override `--color-primary` and `--color-secondary` to
rebrand; everything else derives from them.

| Token | Use |
|---|---|
| `primary`, `primary-light`, `primary-dark`, `primary-bg` | Brand color: main actions, focus rings, links, selection. `primary-bg` is a 10% tint. |
| `secondary`, `secondary-bg` | Accent color (switches when on, highlights). |
| `surface-50` ... `surface-950` | Neutral backgrounds and borders. App background is `bg-surface-50 dark:bg-surface-900`; panels are `bg-white dark:bg-surface-950`. |
| `surface-accent-50` ... `surface-accent-950` | Slightly cool neutrals for hover, field and header backgrounds. |
| `text-primary`, `text-secondary`, `text-disabled` (+ `-dark`) | Text colors: `text-text-secondary dark:text-text-secondary-dark`. |

Fonts: `font-sans` and `font-headers` are Rubik, `font-mono` is JetBrains Mono.

### Style mixins

Class strings exported by the kit, for when you need a surface that isn't a component:

| Mixin | What it gives |
|---|---|
| `paperMixin` | White/dark panel, rounded, thin border: what `Paper` renders. |
| `cardMixin`, `cardClickableMixin`, `cardSelectedMixin` | Card surface, its hover/focus ring when clickable, and its selected state. |
| `defaultBorderMixin` | The standard border color pair. Add `border` / `border-b` yourself. |
| `fieldBackgroundMixin`, `fieldBackgroundHoverMixin`, `fieldBackgroundDisabledMixin` | Input field backgrounds. |
| `focusedClasses`, `focusedDisabled` | The focus ring. |

```tsx
<div className={cls("border-b", defaultBorderMixin)} />
<div className={cls(paperMixin, "p-4")} />
```

## Typography

```tsx
<Typography variant="h4">Orders</Typography>
<Typography variant="body2" color="secondary">Last synced 5 minutes ago</Typography>
<Typography variant="caption" color="secondary">Max 2 MB</Typography>
```

- `variant`: `h1`-`h6`, `subtitle1`, `subtitle2`, `body1` (default), `body2`, `caption`, `label`,
  `button`, `inherit`.
- `color`: `primary` (default: the normal text color, **not** the brand blue), `secondary`
  (muted text), `disabled`, `error`, `inherit`, `initial`.
- `component` renders another element (`component="h1"` for a visually-h4 page title that is the
  document's h1), `gutterBottom`, `noWrap`, `paragraph`, `align`.

Page titles in FireCMS are `h4`; section headings `h5`/`h6`; secondary information
`body2`/`caption` with `color="secondary"`.

## Buttons

```tsx
<Button color="primary" onClick={save}>Save</Button>
<Button variant="outlined" startIcon={<AddIcon/>}>Add product</Button>
<Button variant="text" color="error" onClick={remove}>Delete</Button>
<LoadingButton loading={saving} color="primary" type="submit">Save</LoadingButton>
<Button component="a" href="/docs" variant="text">Docs</Button>
```

`Button` props:

- `variant`: `filled` (default), `outlined`, `text`.
- `color`: `neutral` (default, a grey filled button), `primary`, `secondary`, `error`, `text`.
- `size`: `small`, `medium` (default), `large`, `xl`, `2xl`.
- `startIcon`, `fullWidth`, `disabled`, `component` (render as `a`, a router `Link`...), plus the
  props of the rendered element.

One `color="primary"` filled button per screen or dialog: the main action. Others are `outlined`
or `text`. Destructive actions use `color="error"`.

`LoadingButton` is a `Button` with `loading` (shows a spinner and disables it).

`IconButton` is for icon-only actions. Always pass `aria-label`, and usually wrap it in a `Tooltip`:

```tsx
<Tooltip title="Refresh">
    <IconButton aria-label="Refresh" onClick={reload}>
        <RefreshIcon/>
    </IconButton>
</Tooltip>
```

`IconButton` props: `size` (`smallest`, `small`, `medium`, `large`), `variant` (`ghost`,
`filled`), `shape` (`circular`, `square`), `toggled`, `disabled`, `component`.

`ToggleButtonGroup` is a segmented control:
`<ToggleButtonGroup value={view} onValueChange={setView} options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]}/>`
(options also take `icon` and `disabled`).

## Text inputs

```tsx
<TextField
    label="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    error={!title}
/>
<TextField label="Description" multiline minRows={3} value={desc} onChange={...}/>
<TextField size="small" placeholder="Search..." endAdornment={<SearchIcon/>}/>
```

`TextField`: `label` (a floating label inside the field), `value`, `onChange` (a normal change
event), `type`, `multiline` with `minRows`/`maxRows`, `size` (`smallest`, `small`, `medium`,
`large`, **default `large`**), `error`, `disabled`, `invisible` (no background, for inline
editing), `endAdornment`, `placeholder`, `className` (outer), `inputClassName` (the input). It is
controlled: pass a value and update it.

- `DebouncedTextField`: same props, calls `onChange` after the user pauses typing.
- `TextareaAutosize`: a bare growing textarea, for building your own field.
- `SearchBar`: `onTextSearch(text)`, `placeholder`, `size` (`small` | `medium`), `expandable`,
  `loading`, `initialValue`, `autoFocus`.

Help text under a field: in a FireCMS app use `FieldCaption` from `@firecms/core`
(`<FieldCaption>Shown on the product page</FieldCaption>`); outside it,
`<Typography variant="caption" color="secondary">`.

## Selection inputs

```tsx
<Select label="Status" value={status} onValueChange={setStatus}>
    <SelectItem value="draft">Draft</SelectItem>
    <SelectItem value="published">Published</SelectItem>
</Select>

<MultiSelect label="Tags" value={tags} onValueChange={setTags}>
    <MultiSelectItem value="news">News</MultiSelectItem>
    <MultiSelectItem value="sale">Sale</MultiSelectItem>
</MultiSelect>

<SearchableSelect label="Country" value={country} onValueChange={setCountry}>
    {countries.map(c => <SearchableSelectItem key={c.code} value={c.code}>{c.name}</SearchableSelectItem>)}
</SearchableSelect>
```

- `Select`: `value`, `onValueChange(value)`, `label`, `placeholder`, `renderValue`, `size`,
  `fullWidth`, `error`, `disabled`, `invisible`, `endAdornment`, `position`. Group items with
  `SelectGroup label="..."`.
- `MultiSelect`: `value` (array), `onValueChange(values)`, `useChips`, `includeSelectAll`,
  `includeClear`, `renderValues`, plus the `Select` styling props.
- `SearchableSelect`: a select with a filter box; `allowCustomValues` accepts typed text.
- `Checkbox`: `checked`, `onCheckedChange(checked)`, `indeterminate`, `size`, `color`.
- `BooleanSwitch`: `value`, `onValueChange(value)`, `size`; `allowIndeterminate` for a tri-state.
- `BooleanSwitchWithLabel`: a switch inside a field-style row with `label`, `position`
  (`start`/`end`), `fullWidth`, `error`. Use it for settings toggles.
- `RadioGroup` + `RadioGroupItem`: `value`, `onValueChange`; pair each item with a `Label`.
- `Slider`: `value` (array), `onValueChange`, `min`, `max`, `step`, `size` (`small`, `regular`).
- `DateTimeField`: `value` (`Date | null`), `onChange`, `mode` (`date`, `date_time`), `label`,
  `clearable`, `timezone`, `locale`, `size`.
- `ColorPicker`: picks one of the chip color keys (`value`, `onChange`, `allowClear`).
- `FileUpload`: a dropzone. `accept` (e.g. `{ "image/*": [] }`), `onFilesAdded(files)`,
  `onFilesRejected`, `maxSize`, `maxFiles`, `title`, `uploadDescription`, `size`.
- `Autocomplete` + `AutocompleteItem` (with `useAutoComplete`): a suggestion list under a field you
  control.
- `Label`: a form label (`border` gives it a chip-like outline). `InputLabel` is the floating label
  used inside fields.

## Layout and surfaces

| Component | Use |
|---|---|
| `Container` | Page width wrapper: `maxWidth` `xs`...`7xl`. FireCMS pages use `maxWidth="6xl"`. |
| `CenteredView` | Centers content on the screen (`maxWidth`, `fullScreen`): loading, empty and error screens. |
| `Paper` | A bordered panel (`paperMixin`). Group related content in one. |
| `Card` | A panel that can be clicked (`onClick` adds hover ring, keyboard activation, `role="button"`). |
| `Separator` | A rule. `orientation` is required: `horizontal` or `vertical`. |
| `ExpandablePanel` | A titled section that collapses (`title`, `initiallyExpanded`, `expanded`/`onExpandedChange`, `invisible`, `asField`). |
| `Collapse` | Animated show/hide: `<Collapse in={open}>`. |
| `ResizablePanels` | Two panes with a draggable divider (`firstPanel`, `secondPanel`, `panelSizePercent`, `onPanelSizeChange`, `orientation`). |
| `Tabs` + `Tab` | `value`, `onValueChange`; `mode="primary"` (pill tabs, default) or `"secondary"` (underline tabs for nested panels). |

```tsx
<Tabs value={tab} onValueChange={setTab}>
    <Tab value="details">Details</Tab>
    <Tab value="history">History</Tab>
</Tabs>
```

## Overlays

```tsx
<Dialog open={open} onOpenChange={setOpen} maxWidth="lg">
    <DialogTitle>Rename collection</DialogTitle>
    <DialogContent>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus/>
    </DialogContent>
    <DialogActions>
        <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
        <Button color="primary" onClick={rename}>Rename</Button>
    </DialogActions>
</Dialog>
```

- `Dialog`: `open`, `onOpenChange`, `maxWidth` (`xs`...`7xl`, `full`), `fullWidth`, `fullHeight`,
  `fullScreen`, `scrollable`, `modal`, `disableInitialFocus`. Always compose it with `DialogTitle`,
  `DialogContent`, `DialogActions` (actions are sticky at the bottom; Cancel first, the primary
  action last).
- `Sheet`: a panel sliding in from a side (`open`, `onOpenChange`, `side` `top|bottom|left|right`,
  `title`, `modal`). Give its child a background: `bg-white dark:bg-surface-950`.
- `Popover`: `trigger`, children, `open`/`onOpenChange`, `side`, `align`.
- `Menu` + `MenuItem`: a dropdown menu from a `trigger`
  (`<Menu trigger={<IconButton aria-label="More"><MoreVertIcon/></IconButton>}>`). `MenuItem` takes
  `onClick`, `dense`, `disabled`.
- `Menubar` and its parts (`MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`,
  `MenubarSub`...): an app-style menu bar.
- `Tooltip`: `title` (no title renders the child alone), `side`, `align`, `asChild`.

In a FireCMS app, confirmations, toasts and the side entity form come from `@firecms/core` hooks,
not from building your own: `useSnackbarController().open({ type: "success", message })` and
`ConfirmationDialog` for "Are you sure?".

## Feedback and data display

- `Alert`: `color` (`info`, `success`, `warning`, `error`, `base`), `size`, `action`, `onDismiss`.
  Inline messages inside a view.
- `InfoLabel`: a tinted note block, `mode` `info` | `warn`.
- `Chip`: `colorScheme` (a color key like `"blueLight"`, `"greenDark"`, `"redLighter"`: the hues
  blue, cyan, teal, green, yellow, orange, red, pink, purple, gray, each `Lighter`, `Light`, `Dark`,
  `Darker`), `size`, `outlined`, `icon`, `onClick`. Use chips for statuses and tags.
  `getColorSchemeForSeed(text)` picks a stable color for arbitrary values.
- `FilterChip`: a toggleable chip for filter bars (`active`, `icon`, `size`, `onClick`).
- `Badge`: a dot on its child (`color`, `invisible`).
- `Avatar`: `src`, `alt`, or initials as children.
- `CircularProgress`: spinner (`size` `smallest`...`large`). `Skeleton`: placeholder block
  (`width`, `height`, `className`).
- `Markdown`: renders a markdown string (`source`, `size`).
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`: a styled static table (header row
  tinted, rows divided, `TableRow onClick` adds hover). For collection data in FireCMS, use
  `EntityCollectionView` / the collection table from `@firecms/core` instead of rebuilding one.

```tsx
<Paper className="overflow-hidden">
    <Table className="w-full">
        <TableHeader>
            <TableCell header>Name</TableCell>
            <TableCell header align="right">Total</TableCell>
        </TableHeader>
        <TableBody>
            {orders.map(o => (
                <TableRow key={o.id} onClick={() => open(o)}>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell align="right">{o.total}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</Paper>
```

## Icons

Every Material Symbols icon is exported as a component named in PascalCase plus `Icon`:
`add` is `AddIcon`, `arrow_forward` is `ArrowForwardIcon`, `content_copy` is `ContentCopyIcon`,
`open_in_new` is `OpenInNewIcon`. There are about 2,200.

```tsx
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, SettingsIcon, MoreVertIcon } from "@firecms/ui";

<DeleteIcon size="small" color="error"/>
```

- Props: `size` (`smallest` 16px, `small` 20px, `medium` 24px default, `large` 28px, or a number),
  `color` (`inherit`, `primary`, `secondary`, `disabled`, `error`, `success`, `warning`),
  `className`, `onClick`.
- From a string key (e.g. an icon stored in config): `<Icon iconKey="shopping_cart"/>`.
- Brand icons: `GitHubIcon`, `FirestoreIcon`. Drag handle: `HandleIcon`.
- These are not lucide icons. `PlusIcon`, `TrashIcon`, `XIcon` do not exist; use `AddIcon`,
  `DeleteIcon`, `CloseIcon`.

## Utilities and hooks

- `cls(...classes)`: merge class names, resolving Tailwind conflicts.
- `debounce`, `useDebounceValue`, `useDebounceCallback`.
- `useOutsideAlerter(ref, onOutside)`.
- `PortalContainerProvider` / `usePortalContainer`: where overlays mount, when rendering inside a
  shadow root or iframe.
- In a FireCMS app, the current light/dark mode is `useModeController()` from `@firecms/core`.

## Before you finish

- No import from MUI, lucide, react-icons or `@radix-ui/*`; no new UI dependency in `package.json`.
- No raw `<button>`, `<input>`, `<select>`, `<h1>`-`<h6>` where a kit component exists.
- No hex colors or `style={{ color/background }}`; no `bg-gray-*` / `text-gray-*` for surfaces
  and text; every color class has a `dark:` pair.
- Icon-only buttons have `aria-label` and a `Tooltip`.
- Check the view in dark mode.
