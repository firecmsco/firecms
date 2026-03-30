---
name: rebase-ui-components
description: Guide for using the @rebasepro/ui component library. Use this skill when building UI with Rebase, creating custom views, or needing to know which components are available.
---

# Rebase UI Component Library

`@rebasepro/ui` is Rebase's standalone, production-ready component library built on **Tailwind CSS v4** and **Radix UI**. It's fully typed, accessible, and can be used in any React project.

## Installation

```bash
pnpm add @rebasepro/ui
```

## Core Rules

1. **Always use `@rebasepro/ui`** for all UI components. Check `packages/ui/src/components/` before creating custom ones.
2. **Never use `as any`** — use proper types or `unknown`.
3. **Use `cls()` from `@rebasepro/ui`** for conditional class merging — not template literals.
4. **Use `Typography`** for all text — never raw `<h1>`, `<p>`, `<span>`.
5. **Follow existing patterns** — look at `NavigationCard`, `DefaultHomePage`, or `RolesView` for layout examples.

## Available Components

### Layout
- `Card`, `Paper`, `Container`, `CenteredView`

### Typography
- `Typography`, `Markdown`

### Buttons
- `Button`, `IconButton`, `LoadingButton`

### Form Inputs
- `TextField`, `DebouncedTextField`, `TextareaAutosize`
- `Select`, `MultiSelect`, `Autocomplete`
- `Checkbox`, `BooleanSwitch`, `RadioGroup`, `Slider`
- `DateTimeField`, `ColorPicker`, `FileUpload`

### Dialogs & Overlays
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
- `Menu`, `Menubar`, `MenuItem`, `Popover`, `Sheet`

### Data Display
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Tabs`, `Chip`, `Badge`, `Label`, `InfoLabel`

### Feedback
- `Tooltip`, `Skeleton`, `CircularProgress`, `Separator`
- `Alert`, `Collapse`, `ExpandablePanel`

### Other
- `Avatar`, `SearchBar`
- Icons from `@rebasepro/ui` (e.g., `ArrowForwardIcon`, `AddIcon`, `DeleteIcon`)

## The `cls()` Utility

Use `cls()` (a wrapper around `clsx` + `twMerge`) for conditional class names:

```tsx
import { cls } from "@rebasepro/ui";

<div className={cls(
    "p-4 rounded-lg",
    isActive && "bg-blue-500",
    isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

## Typography Usage

```tsx
import { Typography } from "@rebasepro/ui";

<Typography variant="h4">Page Title</Typography>
<Typography variant="body1">Regular text content</Typography>
<Typography variant="caption" color="secondary">Helper text</Typography>
```

## Tailwind CSS v4

Rebase uses Tailwind CSS v4 with CSS-first configuration:
- No `tailwind.config.js` — configuration is in CSS
- CSS variables for theming
- Native cascade layers

## Creating Custom Views

When building custom views for the Rebase Studio:

```tsx
import { Card, Typography, Button, Container } from "@rebasepro/ui";

export function DashboardView() {
    return (
        <Container maxWidth="4xl">
            <Typography variant="h4" className="mb-4">
                Dashboard
            </Typography>
            <Card className="p-6">
                <Typography variant="body1">
                    Your custom dashboard content
                </Typography>
                <Button variant="filled" className="mt-4">
                    Take Action
                </Button>
            </Card>
        </Container>
    );
}
```

## References

- **Component Catalog:** See [references/component-catalog.md](references/component-catalog.md) for full component API documentation.
- **Theming:** See [references/theming.md](references/theming.md) for customizing colors, fonts, and dark mode.
- **Icons:** See [references/icons.md](references/icons.md) for the complete icon set.
