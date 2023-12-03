import React from "react";
import { Checkbox } from "../../ui/Checkbox";

/**
 * @group Preview components
 */
export function BooleanPreview({ value }: {
    value: boolean
}): React.ReactElement {
    return <Checkbox checked={value}/>;
}
