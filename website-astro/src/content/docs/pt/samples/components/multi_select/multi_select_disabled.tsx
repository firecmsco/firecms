import * as React from "react";
import { MultiSelect, MultiSelectItem } from "@firecms/ui";

export default function MultiSelectDisabledDemo() {
    return (
        <MultiSelect
            disabled
            label="Disabled MultiSelect"
            value={["option1"]}
            renderValues={(values) => (values.map((value) =>
                    <span
                        key={value}
                        style={{
                        marginRight: 8,
                        background: "#eee",
                        padding: 4
                    }}>
                    {value}
                </span>)
            )}>
            <MultiSelectItem value="option1">Option 1</MultiSelectItem>
            <MultiSelectItem value="option2">Option 2 is disabled</MultiSelectItem>
            <MultiSelectItem value="option3">Option 3 is disabled</MultiSelectItem>
        </MultiSelect>
    );
}
