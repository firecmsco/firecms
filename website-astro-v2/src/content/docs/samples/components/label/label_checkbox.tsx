import React from "react";
import { Checkbox, Label } from "@firecms/ui";

export default function LabelCheckboxDemo() {

    const [checked, setChecked] = React.useState(false);

    return (
        <Label
            border={true}
            className="cursor-pointer p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
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
