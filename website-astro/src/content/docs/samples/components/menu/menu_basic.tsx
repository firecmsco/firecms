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
