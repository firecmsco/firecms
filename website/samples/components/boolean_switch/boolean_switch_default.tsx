import React, { useState } from "react";
import { BooleanSwitch } from "firecms";

export default function BooleanSwitchDefaultDemo() {
    const [value, setValue] = useState(true);
    return (
        <BooleanSwitch
            value={value}
            onValueChange={setValue}
        />
    );
}
