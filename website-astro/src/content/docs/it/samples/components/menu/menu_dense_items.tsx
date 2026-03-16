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
