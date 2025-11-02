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
