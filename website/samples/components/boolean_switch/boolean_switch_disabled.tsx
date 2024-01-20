import React from "react";
import { BooleanSwitch } from "firecms";

export default function BooleanSwitchDisabledDemo() {
    return (
        <BooleanSwitch
            value={true}
            disabled={true}
        />
    );
}
