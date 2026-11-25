---
name: firecms-design-language
description: How FireCMS screens are composed, with copy-paste skeletons for list pages, settings pages, dashboards, entity side panels, dialogs and empty, loading and error states. Use this skill before building or restyling any view, page, panel or dashboard in a FireCMS project, so it looks like the rest of the app.
---

# FireCMS design language

FireCMS has one look: quiet, flat, bordered panels on a light grey (or near-black) background,
Rubik type, one blue for the main action, and dense but airy spacing. A custom view should be
impossible to tell apart from a built-in one such as the Users page or Project settings.

Use the components from **`firecms-ui-components`** (`@firecms/ui`). This skill is about putting
them together. The skeletons below are taken from FireCMS's own screens
(`UsersView` in `@firecms/user_management`, `ProjectSettings` in `@firecms/cloud`, the home page in
`@firecms/core`).

## Ten rules

1. **One page width.** Top-level views are a `Container maxWidth="6xl"`. Don't invent narrow or
   full-bleed layouts unless the view is a canvas (a map, an editor, a board).
2. **Title row first.** An `h4` page title on the left, at most one primary action on the right,
   with `mt-12` above it. No hero banners, no gradients, no big illustrations.
3. **Flat, bordered surfaces.** Group content in `Paper` / `Card` (thin border, `rounded-md`,
   white or `surface-950`). No heavy drop shadows, no colored panel backgrounds. A card may lift a
   little on hover (`hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5`), as the home
   cards do.
4. **Color is for meaning.** Neutral surfaces everywhere; `primary` only for the main action,
   links, focus and selection; red only for errors and destructive actions; status shown with
   `Chip` color schemes. Never hard-code hex colors.
5. **Spacing on the 4px scale, in a few steps.** `gap-2` inside a control group, `gap-4` between
   fields and cards, `gap-8`/`gap-16` between page sections. Padding `p-4` in panels, `p-8` in roomy
   ones. Use `gap-*` on flex/grid parents rather than margins on children.
6. **Type hierarchy is short.** Page `h4`, section `h5`/`h6`, body `body1`/`body2`, metadata
   `caption` or `body2` with `color="secondary"`. Use `Typography`, never raw headings.
7. **Forms are vertical.** Full-width fields stacked with `gap-4`, help text under each field, the
   submit button at the end (or in `DialogActions`). Settings toggles are `BooleanSwitchWithLabel`
   with `position="start"`.
8. **Every state is designed.** Loading (`CircularProgress` or `Skeleton`), empty (a short
   sentence + the action that fixes it), error (`Alert color="error"` with what happened and what
   to do). Never a blank screen.
9. **Light and dark both work.** Use tokens and kit components; any color class you add has its
   `dark:` pair. Check both modes (the toggle is in the FireCMS app bar's user menu).
10. **Reuse the CMS before rebuilding it.** Lists of documents use `EntityCollectionView`, editing
    opens `useSideEntityController().open(...)`, picking a document uses `useReferenceDialog`,
    toasts are `useSnackbarController()`, confirmations `ConfirmationDialog`: all from
    `@firecms/core`.

## Skeleton: list page

A top-level view (registered as a `CMSView` in the app's `views`) listing things with one main
action.

```tsx
import { AddIcon, Alert, Button, Container, Paper, Table, TableBody, TableCell, TableHeader, TableRow, Typography } from "@firecms/ui";

export function SuppliersView() {
    const { suppliers, loading, error } = useSuppliers();

    return (
        <Container className="w-full flex flex-col py-4 gap-4" maxWidth="6xl">
            <div className="flex items-center mt-12">
                <Typography gutterBottom variant="h4" component="h1" className="flex-grow">
                    Suppliers
                </Typography>
                <Button size="large" startIcon={<AddIcon/>} onClick={openNewSupplier}>
                    Add supplier
                </Button>
            </div>

            {error && <Alert color="error">Could not load suppliers: {error.message}</Alert>}

            <Paper className="overflow-hidden">
                <Table className="w-full">
                    <TableHeader>
                        <TableCell header>Name</TableCell>
                        <TableCell header>Country</TableCell>
                        <TableCell header align="right">Products</TableCell>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map(s => (
                            <TableRow key={s.id} onClick={() => openSupplier(s)}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.country}</TableCell>
                                <TableCell align="right">{s.productCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!loading && suppliers.length === 0 && <EmptyState/>}
            </Paper>
        </Container>
    );
}
```

If the rows are Firestore documents of a collection, don't build this table at all: render
`<EntityCollectionView {...collection} fullPath="suppliers"/>` from `@firecms/core`, which brings
filtering, sorting, inline editing and the side form.

## Skeleton: settings page

```tsx
import { BooleanSwitchWithLabel, Button, Container, Paper, Select, SelectItem, TextField, Typography } from "@firecms/ui";
import { FieldCaption } from "@firecms/core";

export function StoreSettingsView() {
    return (
        <Container maxWidth="6xl" className="w-full flex flex-col gap-16 px-4 py-16">

            <section className="flex flex-col gap-4">
                <Typography variant="h4" component="h1" className="mt-4 mb-2">Store settings</Typography>

                <div>
                    <TextField label="Store name" value={name} onChange={(e) => setName(e.target.value)}/>
                    <FieldCaption>Shown in emails and on invoices.</FieldCaption>
                </div>

                <div>
                    <Select label="Currency" value={currency} onValueChange={setCurrency}>
                        <SelectItem value="EUR">Euro</SelectItem>
                        <SelectItem value="USD">US dollar</SelectItem>
                    </Select>
                    <FieldCaption>Prices are stored in this currency.</FieldCaption>
                </div>

                <div>
                    <BooleanSwitchWithLabel
                        position="start"
                        label="Accept orders"
                        value={acceptOrders}
                        onValueChange={setAcceptOrders}/>
                    <FieldCaption>Turn off to pause the shop without hiding it.</FieldCaption>
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <Typography variant="h5" component="h2">Danger zone</Typography>
                <Paper className="p-4 flex items-center gap-4">
                    <Typography variant="body2" className="flex-grow">
                        Delete every order older than two years. This cannot be undone.
                    </Typography>
                    <Button variant="outlined" color="error" onClick={confirmPurge}>Delete old orders</Button>
                </Paper>
            </section>
        </Container>
    );
}
```

## Skeleton: dashboard / overview

Cards in a responsive grid, the same grid the home page uses.

```tsx
import { Card, Container, Paper, Typography, ArrowForwardIcon } from "@firecms/ui";

<Container className="w-full flex flex-col py-4 gap-8" maxWidth="6xl">
    <Typography variant="h4" component="h1" className="mt-12">Overview</Typography>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
            <Paper key={stat.label} className="p-4 flex flex-col gap-1">
                <Typography variant="caption" color="secondary">{stat.label}</Typography>
                <Typography variant="h5">{stat.value}</Typography>
            </Paper>
        ))}
    </div>

    <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">Shortcuts</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortcuts.map(s => (
                <Card key={s.path}
                      className="h-full px-4 py-3 min-h-[120px] flex flex-col transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
                      onClick={() => navigate(s.path)}>
                    <Typography variant="subtitle1" component="h3" className="font-medium">{s.name}</Typography>
                    <Typography variant="caption" color="secondary" className="flex-grow">{s.description}</Typography>
                    <ArrowForwardIcon className="text-primary self-end" size="small"/>
                </Card>
            ))}
        </div>
    </section>
</Container>
```

## Skeleton: entity custom view (a tab in the side panel)

Entity views (`EntityCustomView`) render beside the form, in a narrower panel. No `Container`;
pad the content and let it scroll.

```tsx
import { EntityCustomViewParams } from "@firecms/core";
import { Paper, Typography } from "@firecms/ui";

export function ProductPreview({ modifiedValues }: EntityCustomViewParams<Product>) {
    return (
        <div className="w-full h-full overflow-auto p-4 md:p-8 flex flex-col gap-4">
            <Typography variant="h6" component="h2">Preview</Typography>
            <Paper className="p-4 flex flex-col gap-2">
                <Typography variant="subtitle1">{modifiedValues?.name ?? "Untitled"}</Typography>
                <Typography variant="body2" color="secondary">{modifiedValues?.description}</Typography>
            </Paper>
        </div>
    );
}
```

## Skeleton: dialog

```tsx
<Dialog open={open} onOpenChange={setOpen} maxWidth="lg">
    <DialogTitle>Invite a teammate</DialogTitle>
    <DialogContent className="flex flex-col gap-4">
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus/>
        <Select label="Role" value={role} onValueChange={setRole}>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
        </Select>
    </DialogContent>
    <DialogActions>
        <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
        <LoadingButton color="primary" loading={sending} onClick={invite}>Send invite</LoadingButton>
    </DialogActions>
</Dialog>
```

## Empty, loading and error states

```tsx
import { Alert, Button, CenteredView, CircularProgress, Skeleton, Typography } from "@firecms/ui";

// Whole view loading
if (loading) return <CenteredView><CircularProgress/></CenteredView>;

// Part of a view loading: keep the layout, fill it with skeletons
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full"/>)}
</div>

// Empty
function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
            <Typography variant="body1">No suppliers yet.</Typography>
            <Typography variant="body2" color="secondary">Suppliers you add appear here, with their products.</Typography>
            <Button variant="outlined" startIcon={<AddIcon/>} onClick={openNewSupplier}>Add supplier</Button>
        </div>
    );
}

// Error: say what failed and what to do
<Alert color="error" action={<Button variant="text" size="small" onClick={retry}>Retry</Button>}>
    Could not load suppliers. Check your connection and try again.
</Alert>
```

## Copy

- Sentence case everywhere: "Add supplier", not "Add Supplier".
- Buttons say what happens: "Send invite", "Delete 3 orders", not "OK" / "Submit".
- Errors say what happened and what the user can do next. No raw exception text alone.
- Short. A caption is one sentence.

## What not to do

| Instead of | Do |
|---|---|
| A custom navbar, sidebar or app shell inside a view | Nothing: FireCMS renders the shell; your view is the content area. |
| `<div style={{ padding: 20, background: "#fff", boxShadow: ... }}>` | `<Paper className="p-4">` |
| `bg-gray-100`, `text-gray-500`, `border-gray-200` | `bg-surface-50 dark:bg-surface-900`, `<Typography color="secondary">`, `defaultBorderMixin` |
| Gradient headers, hero sections, emoji headings | An `h4` title row |
| Several blue filled buttons | One `color="primary"` action; others `outlined` / `text` |
| A hand-built table of Firestore documents | `EntityCollectionView` |
| A custom modal with a fixed `div` overlay | `Dialog` + `DialogTitle` / `DialogContent` / `DialogActions` |
| `alert()` / `window.confirm()` | `useSnackbarController()` / `ConfirmationDialog` |
| A new UI or icon library | `@firecms/ui` and its Material icons |

## Checklist before you finish

- The view sits in `Container maxWidth="6xl"` (top-level) or a padded scroll area (side panel).
- One `h4` title; one primary action.
- Only kit components and tokens; no hex colors; `dark:` pairs on any color class.
- Loading, empty and error states exist.
- It looks right in dark mode and at a phone width (grids collapse to one column).
