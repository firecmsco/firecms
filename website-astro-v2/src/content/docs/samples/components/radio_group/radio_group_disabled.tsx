import React from "react";
import { Label, RadioGroup, RadioGroupItem } from "@firecms/ui";

export default function RadioGroupDisabledDemo() {
    return (
        <RadioGroup className="flex items-center gap-2" defaultValue="black" id="color">
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="color-black"
            >
                <RadioGroupItem id="color-black" value="black"/>
                Black
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="color-white"
            >
                <RadioGroupItem id="color-white" value="white" disabled/>
                White
            </Label>
            <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
                htmlFor="color-blue"
            >
                <RadioGroupItem id="color-blue" value="blue"/>
                Blue
            </Label>
        </RadioGroup>
    );
}
