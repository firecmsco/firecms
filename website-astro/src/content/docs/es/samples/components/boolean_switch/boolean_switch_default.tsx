import React, { useState } from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchDefaultDemo() {
    const [value, setValue] = useState(true);
    return (
        <BooleanSwitch
            value={value}
            onValueChange={setValue}
        />
    );
}
