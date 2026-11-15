import React from "react";

import { EnumValuesChip, PropertyPreviewProps } from "../../preview/index.js";
import { enumToObjectEntries } from "../../util/index.js";

/**
 * @group Preview components
 */
export function NumberPropertyPreview({
                                          value,
                                          property,
                                          size
                                      }: PropertyPreviewProps<number>): React.ReactElement {

    if (property.enumValues) {
        const enumKey = value;
        const enumValues = enumToObjectEntries(property.enumValues);
        if (!enumValues)
            return <span className={size === "small" ? "text-sm" : ""}>{value}</span>;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            size={size !== "medium" ? "small" : "medium"}/>;
    } else {
        return <span className={size === "small" ? "text-sm" : ""}>{value}</span>;
    }
}
