import React from "react";

import { EnumValuesChip } from "../components/ColorChip";
import { resolveEnumValues } from "../../core";
import { PropertyPreviewProps } from "../PropertyPreviewProps";

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
        const enumValues = resolveEnumValues(property.enumValues);
        if (!enumValues)
            return <>{value}</>;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
