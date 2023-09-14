import React from "react";

import { EnumValuesChip } from "../components/EnumValuesChip";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { enumToObjectEntries } from "../../core";

/**
 * @category Preview components
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
            return <>{value}</>;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            size={size !== "medium" ? "small" : "medium"}/>;
    } else {
        return <>{value}</>;
    }
}
