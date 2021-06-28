import React from "react";

import { EnumValuesChip } from "./CustomChip";
import { PreviewComponentProps } from "../preview_component_props";

/**
 * @category Preview components
 */
export default function NumberPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<number>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumKey = value;
        const enumValues = property.config.enumValues;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
