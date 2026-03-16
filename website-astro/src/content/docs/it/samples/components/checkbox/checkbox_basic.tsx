import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxBasicDemo() {
    const [checked, setChecked] = useState(true);

    return (
        <Checkbox
            checked={checked}
            onCheckedChange={(newChecked) => setChecked(newChecked)}
        />
    );
}
