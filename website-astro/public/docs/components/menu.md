# Menu


The `Menu` component provides a flexible dropdown menu functionality. It leverages the `@radix-ui/react-dropdown-menu` for accessibility and customization features. The `Menu` component and its sub-component, `MenuItem`, can be easily styled and incorporated into your UI for various needs such as navigation menus, options menus, and more.

## Usage

The `Menu` component requires a `trigger` element to toggle the visibility of the menu and can accept any ReactNode as its children, which typically includes `MenuItem` components for the menu options.

## Basic Menu

A simple example of using the `Menu` component to create a dropdown menu.

```tsx
import React from "react";
import { Button, Menu, MenuItem } from "@firecms/ui";

export default function MenuBasicDemo() {
    return (
        <Menu trigger={<Button>Open Menu</Button>}>
            <MenuItem onClick={() => alert("Menu Item 1 clicked")}>Menu Item 1</MenuItem>
            <MenuItem onClick={() => alert("Menu Item 2 clicked")}>Menu Item 2</MenuItem>
            <MenuItem onClick={() => alert("Menu Item 3 clicked")}>Menu Item 3</MenuItem>
        </Menu>
    );
}

```

## Controlled Menu

You can control the visibility of the `Menu` component by passing the `open` and `onOpenChange` props.

```tsx
import React from "react";
import { Button, Menu, MenuItem } from "@firecms/ui";

export default function MenuCustomTriggerDemo() {

    const [open, setOpen] = React.useState(false);

    return (
        <Menu
            onOpenChange={setOpen}
            open={open}
            trigger={
                <Button onClick={() => setOpen(true)}>Click me</Button>
            }>
            <MenuItem onClick={() => alert("Action 1")}>Action 1</MenuItem>
            <MenuItem onClick={() => alert("Action 2")}>Action 2</MenuItem>
            <MenuItem onClick={() => alert("Action 3")}>Action 3</MenuItem>
        </Menu>
    );
}

```

## Dense Menu Items

Showing how to make the `MenuItem` components dense for a more compact menu appearance.

```tsx
import React from "react";
import { Button, Menu, MenuItem } from "@firecms/ui";

export default function MenuDenseItemsDemo() {
    return (
        <Menu trigger={<Button>Dense Menu</Button>}>
            <MenuItem dense onClick={() => alert("Dense Item 1 clicked")}>Dense Item 1</MenuItem>
            <MenuItem dense onClick={() => alert("Dense Item 2 clicked")}>Dense Item 2</MenuItem>
            <MenuItem dense onClick={() => alert("Dense Item 3 clicked")}>Dense Item 3</MenuItem>
        </Menu>
    );
}

```

