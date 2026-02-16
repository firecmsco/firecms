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
