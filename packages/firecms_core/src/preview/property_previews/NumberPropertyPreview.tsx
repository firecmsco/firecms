import React from "react";

import { EnumValuesChip } from "../../preview";
import { PropertyPreviewProps } from "@firecms/types";
import { enumToObjectEntries } from "@firecms/util";

/**
 * @group Preview components
 */
export function NumberPropertyPreview({
                                          value,
                                          property,
                                          size
                                      }: PropertyPreviewProps<number>): React.ReactElement {

    if (property.enum) {
        const enumKey = value;
        const enumValues = enumToObjectEntries(property.enum);
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
