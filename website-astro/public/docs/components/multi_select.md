# MultiSelect


MultiSelect allows users to select multiple options from a dropdown list. It supports opening and closing states, custom value rendering, and keyboard navigation among other features.

## Usage

To use the `MultiSelect`, import it alongside its item component. You can pass props like `value`, `onMultiValueChange`, `size`, `label`, `disabled`, and many more to customize its behavior and appearance.

## Basic MultiSelect

A simple example demonstrating the basic usage of the `MultiSelect` component.

```tsx
import * as React from "react";
import { MultiSelect, MultiSelectItem } from "@firecms/ui";

export default function MultiSelectBasicDemo() {
    const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

    return (
        <MultiSelect
            value={selectedValues}
            onValueChange={setSelectedValues}
            label="Basic MultiSelect">
            <MultiSelectItem value="option1">Option 1</MultiSelectItem>
            <MultiSelectItem value="option2">Option 2</MultiSelectItem>
            <MultiSelectItem value="option3">Option 3</MultiSelectItem>
        </MultiSelect>
    );
}

```

## Custom Value Rendering

This example shows how to customize the rendering of selected values.

```tsx
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

```

## Handling Disabled State

An example to demonstrate a `MultiSelect` component in a disabled state.

```tsx
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

```

