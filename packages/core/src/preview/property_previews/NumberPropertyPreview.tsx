import React from "react";

import { EnumValuesChip } from "../../preview";
import { NumberProperty, PropertyPreviewProps } from "@rebasepro/types";
import { enumToObjectEntries } from "@rebasepro/common";

/**
 * @group Preview components
 */
export function NumberPropertyPreview({
    value,
    property,
    size
}: PropertyPreviewProps<NumberProperty>): React.ReactElement {

    if (property.enum) {
        const enumKey = value;
        const enumValues = enumToObjectEntries(property.enum);
        if (!enumValues)
            return <span className={size === "small" ? "text-sm" : ""}>{value}</span>;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            size={size !== "medium" ? "small" : "medium"} />;
    } else {
        return <span className={size === "small" ? "text-sm" : ""}>{value}</span>;
    }
}
