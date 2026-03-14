import React from "react";
import { BooleanSwitch } from "@rebasepro/ui";

export default function BooleanSwitchDisabledDemo() {
    return (
        <BooleanSwitch
            value={true}
            disabled={true}
        />
    );
}
