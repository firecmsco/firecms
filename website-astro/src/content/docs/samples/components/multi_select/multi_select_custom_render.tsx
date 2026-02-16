import * as React from "react";
import { MultiSelect, MultiSelectItem } from "@firecms/ui";

export default function MultiSelectCustomRenderDemo() {
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    return (
        <MultiSelect
            value={selectedValues}
            onValueChange={setSelectedValues}
            label="Custom Render MultiSelect"
            renderValues={(values) => (values.map((value, index) =>
                <span key={index} style={{
                    marginRight: 8,
                    background: "#eee",
                    padding: 4
                }}>
                    {value}
                </span>)
            )}>
            <MultiSelectItem value="red">Red</MultiSelectItem>
            <MultiSelectItem value="green">Green</MultiSelectItem>
            <MultiSelectItem value="blue">Blue</MultiSelectItem>
        </MultiSelect>
    );
}
