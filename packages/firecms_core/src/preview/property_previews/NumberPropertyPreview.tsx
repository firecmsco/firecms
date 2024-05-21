import React from "react";

import { EnumValuesChip, PropertyPreviewProps } from "../../preview";
import { enumToObjectEntries } from "../../util";

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
        console.log("NumberPropertyPreview", enumValues)
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
