import React, { useState } from "react";
import { Checkbox } from "@firecms/ui";

export default function CheckboxColorDemo() {
    const [checkedPrimary, setCheckedPrimary] = useState(true);
    const [checkedSecondary, setCheckedSecondary] = useState(true);

    return (
        <div className="flex flex-col items-center gap-4">
            <Checkbox
                size="medium"
                checked={checkedPrimary}
                onCheckedChange={setCheckedPrimary}
                color="primary"
            />
            <Checkbox
                size="medium"
                checked={checkedSecondary}
                onCheckedChange={setCheckedSecondary}
                color="secondary"
            />
        </div>
    );
}
