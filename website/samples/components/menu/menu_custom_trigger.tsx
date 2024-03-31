import React from "react";
import { Menu, MenuItem } from "@firecms/ui";

export default function MenuCustomTriggerDemo() {
    return (
        <Menu trigger={<div style={{ cursor: 'pointer', padding: '10px', background: 'grey', color: 'white' }}>Click me</div>}>
            <MenuItem onClick={() => alert("Action 1")}>Action 1</MenuItem>
            <MenuItem onClick={() => alert("Action 2")}>Action 2</MenuItem>
            <MenuItem onClick={() => alert("Action 3")}>Action 3</MenuItem>
        </Menu>
    );
}