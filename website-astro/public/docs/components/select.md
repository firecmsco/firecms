# Select

Select is a form component that provides a dropdown menu for users to choose from among several options. It supports single and multiple selections, customizable styles, and integration with form libraries.

## Usage

To use the `Select` component in your web application, start by importing it along with `SelectItem` for individual
options and `SelectGroup` if you need to group related options together. The `Select` component can be highly
customized to fit your specific user interface requirements. This allows you to control its appearance, such as its
size, shape, and color, to match the overall design of your application. Additionally, you can modify its behavior,
including how it handles user interactions, whether it supports multiple selections, and how it displays selected items.
This level of customization makes it a versatile tool for creating intuitive and responsive dropdown menus
that improve user experience.

## Basic Select

A basic usage of the select component with minimal configuration.

```tsx
import React from "react";
import { Select, SelectItem } from "@firecms/ui";

export default function SelectBasicDemo() {
    const [selected, setSelected] = React.useState<string>();

    return (
        <Select
            value={selected}
            size={"large"}
            onValueChange={setSelected}
            placeholder={<i>Select a character</i>}
            renderValue={(value) => {
                if (value === "homer") {
                    return "Homer";
                } else if (value === "marge") {
                    return "Marge";
                } else if (value === "bart") {
                    return "Bart";
                } else if (value === "lisa") {
                    return "Lisa";
                }
                throw new Error("Invalid value");
            }}
        >
            <SelectItem value="homer">Homer</SelectItem>
            <SelectItem value="marge">Marge</SelectItem>
            <SelectItem value="bart">Bart</SelectItem>
            <SelectItem value="lisa">Lisa</SelectItem>
        </Select>
    );
}

```

## Customized Select

A select component with custom styles and functionalities.

```tsx
import React from "react";
import { Chip, Select, SelectItem } from "@firecms/ui";

const beverages = {
    coffee: "Coffee",
    tea: "Tea",
    juice: "Juice",
    soda: "Soda",
    water: "Water"
}

export default function SelectCustomDemo() {
    const [selected, setSelected] = React.useState("");

    return (
        <Select
            value={selected}
            onValueChange={setSelected}
            size="medium"
            className="w-[400px] bg-yellow-200 dark:bg-yellow-800"
            inputClassName="custom-input-class"
            placeholder="Select your drinks"
            renderValue={(value) => {
                return <Chip key={value}>{beverages[value]}</Chip>;
            }}
        >
            {Object.entries(beverages).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                    {label}
                </SelectItem>
            ))}
        </Select>
    );
}

```

## Select with Groups

Demonstrates how to group options under labels using `SelectGroup`.

```tsx
import React from "react";
import { Select, SelectItem, SelectGroup } from "@firecms/ui";

export default function SelectGroupDemo() {
    const [selected, setSelected] = React.useState("");

    return (
        <Select
            size={"large"}
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

```

## Select Component Props

The `Select` component in FireCMS UI is highly customizable through various props. Below is a comprehensive list of props you can use to tailor the `Select` component to your needs:

- `open`: Controls whether the select dropdown is open. Defaults to `false`.
- `name`: The name attribute for the select input element.
- `id`: The id attribute for the select input element.
- `onOpenChange`: Callback when the open state changes.
- `value`: The current value(s) of the select component, which can be a `string` or an array of `strings` for multiple selections.
- `className`: Additional classes to apply to the root element.
- `inputClassName`: Additional classes to apply to the input element.
- `onChange`: Handler function called when the select value changes.
- `onValueChange`: Callback when the value changes.
- `onMultiValueChange`: Callback when the value changes in a multiple select.
- `placeholder`: The placeholder text displayed when no value is selected.
- `renderValue`: Custom render function for the selected value.
- `renderValues`: Custom render function for the selected values in multiple select.
- `size`: The size of the select component, can be `"small"` or `"medium"`. Defaults to `"medium"`.
- `label`: The label displayed above the select field, can be a `ReactNode` or a `string`.
- `disabled`: Disables the select component. Defaults to `false`.
- `error`: Sets the select component in an error state. Defaults to `false`.
- `position`: Position of the dropdown relative to the trigger, can be `"item-aligned"` or `"popper"`. Defaults to `"item-aligned"`.
- `endAdornment`: Element to be placed at the end of the select input.
- `multiple`: Enables multiple selection mode. Defaults to `false`.
- `inputRef`: Ref object for the select input element.
- `padding`: Adds padding to the select input. Defaults to `true`.
- `invisible`: Hides the select component but keeps it in the DOM.
- `children`: Content to be rendered as the options within the select component.

