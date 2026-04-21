# Radio Group


Radio Group allows users to select one option from a set. It's useful for exclusive selection scenarios where only one choice is permissible.
Each radio group item is represented by a `RadioGroupItem` component, and typically wrapped by a `Label` component.

## Usage

To use the `RadioGroup` and `RadioGroupItem`, import them from your components and structure your options using the `RadioGroup` as the container and `RadioGroupItem` for each option.

## Basic Radio Group

A basic example of a radio group, allowing for simple selection.

```tsx
import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupBasicDemo() {
    return (
        <RadioGroup onValueChange={(value) => console.log(value)}>
            <Label
                className="flex items-center gap-2"
                htmlFor="color-black">
                <RadioGroupItem id="color-black" value="black"/>
                Black
            </Label>
            <Label
                className="flex items-center gap-2"
                htmlFor="color-white">
                <RadioGroupItem id="color-white" value="white"/>
                White
            </Label>
            <Label
                className="flex items-center gap-2"
                htmlFor="color-blue">
                <RadioGroupItem id="color-blue" value="blue"/>
                Blue
            </Label>
        </RadioGroup>
    );
}

```

## Customizing Radio Group Item Appearance

This example demonstrates how to customize the appearance of individual radio group items.

```tsx
import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupCustomDemo() {
    return (
        <RadioGroup onValueChange={(value) => console.log(value)}>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="size-small">
                <RadioGroupItem id="size-small" value="small"/>
                Small
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="size-medium">
                <RadioGroupItem id="size-medium" value="medium"/>
                Medium
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="size-large">
                <RadioGroupItem id="size-large" value="large"/>
                Large
            </Label>
        </RadioGroup>
    );
}

```

## Disabled Radio Group

How to disable the entire radio group or individual items within it.

```tsx
import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupDisabledDemo() {
    return (
        <RadioGroup className="flex items-center gap-2" defaultValue="black" id="color">
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="color-black"
            >
                <RadioGroupItem id="color-black" value="black"/>
                Black
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="color-white"
            >
                <RadioGroupItem id="color-white" value="white" disabled/>
                White
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                htmlFor="color-blue"
            >
                <RadioGroupItem id="color-blue" value="blue"/>
                Blue
            </Label>
        </RadioGroup>
    );
}

```

