# Label


The `Label` component is a simple and versatile component used to display text content with a label style.
You usually use it to display a label for an input field, like a checkbox, or radio button.

## Usage

To use the `Label` component, import it from your components. You can pass a `border` prop to add a border around the label.
You can also pass any of the HTML `label` props, such as `htmlFor`, `className`, and `style`.

## Label with a Checkbox

Simple example of using the `Label` component to create a basic surface for content.

```tsx
import React from "react";
import { Checkbox, Label } from "@firecms/ui";

export default function LabelCheckboxDemo() {

    const [checked, setChecked] = React.useState(false);

    return (
        <Label
            border={true}
            className="cursor-pointer p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
            htmlFor="my-filter"
        >
            <Checkbox id="my-filter"
                      checked={checked}
                      size={"small"}
                      onCheckedChange={setChecked}/>
            Filter for null values
        </Label>
    );
}

```

## Label with a Radio Button

This is an example of using the `Label` component with a radio button.

```tsx
import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function LabelRadioButtonDemo() {
    return (
        <div className={"flex flex-col gap-2"}>
            <Label className="text-base" htmlFor="color">
                Color
            </Label>
            <RadioGroup className="flex flex-col gap-2" defaultValue="black" id="color">
                <Label
                    border={true}
                    className="cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                    htmlFor="color-black"
                >
                    <RadioGroupItem id="color-black" value="black"/>
                    Black
                </Label>
                <Label
                    border={true}
                    className="cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                    htmlFor="color-white"
                >
                    <RadioGroupItem id="color-white" value="white"/>
                    White
                </Label>
                <Label
                    border={true}
                    className="cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                    htmlFor="color-blue"
                >
                    <RadioGroupItem id="color-blue" value="blue"/>
                    Blue
                </Label>
            </RadioGroup>
        </div>
    );
}

```

