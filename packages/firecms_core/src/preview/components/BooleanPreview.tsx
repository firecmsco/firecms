import React from "react";
import { Checkbox } from "@firecms/ui";

/**
 * @group Preview components
 */
export function BooleanPreview({ value }: {
    value: boolean
}): React.ReactElement {
    return <Checkbox checked={value} color={"secondary"}/>;
}
