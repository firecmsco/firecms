import * as React from "react";
import { MultiSelect, MultiSelectItem } from "@firecms/ui";

export default function MultiSelectBasicDemo() {
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    return (
        <MultiSelect
            value={selectedValues}
            onMultiValueChange={setSelectedValues}
            label="Basic MultiSelect">
            <MultiSelectItem value="option1">Option 1</MultiSelectItem>
            <MultiSelectItem value="option2">Option 2</MultiSelectItem>
            <MultiSelectItem value="option3">Option 3</MultiSelectItem>
        </MultiSelect>
    );
}