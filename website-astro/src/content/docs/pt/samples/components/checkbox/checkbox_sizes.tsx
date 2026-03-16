import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxSizeDemo() {
    const [checked, setChecked] = useState(true);

    return (
        <div className="flex flex-col items-center gap-4">
            <Checkbox
                size="small"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
            <Checkbox
                size="medium"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
            <Checkbox
                size="large"
                checked={checked}
                onCheckedChange={setChecked}
                color="primary"/>
        </div>
    );
}
