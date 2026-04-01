import React from "react";
import { BooleanSwitch } from "@firecms/ui";

export default function BooleanSwitchDisabledDemo() {
    return (
        <BooleanSwitch
            value={true}
            disabled={true}
        />
    );
}
