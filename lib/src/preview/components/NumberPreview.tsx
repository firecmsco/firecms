import React from "react";

import { EnumValuesChip } from "./CustomChip";
import { PreviewComponentProps } from "../internal";

/**
 * @category Preview components
 */
export function NumberPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<number>): React.ReactElement {

    if (property.enumValues) {
        const enumKey = value;
        const enumValues = property.enumValues;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
