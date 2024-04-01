import React from "react";
import { Select, SelectItem, SelectGroup } from "@firecms/ui";

export default function SelectGroupDemo() {
    const [selected, setSelected] = React.useState("");

    return (
        <Select
            value={selected}
            onValueChange={setSelected}
            placeholder="Select an option"
        >
            <SelectGroup label="Group 1">
                <SelectItem value="option1-1">Option 1-1</SelectItem>
                <SelectItem value="option1-2">Option 1-2</SelectItem>
            </SelectGroup>
            <SelectGroup label="Group 2">
                <SelectItem value="option2-1">Option 2-1</SelectItem>
                <SelectItem value="option2-2">Option 2-2</SelectItem>
            </SelectGroup>
        </Select>
    );
}