import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupCustomDemo() {
    return (
        <RadioGroup onValueChange={(value) => console.log(value)}>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="size-small">
                <RadioGroupItem id="size-small" value="small"/>
                Small
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="size-medium">
                <RadioGroupItem id="size-medium" value="medium"/>
                Medium
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="size-large">
                <RadioGroupItem id="size-large" value="large"/>
                Large
            </Label>
        </RadioGroup>
    );
}
