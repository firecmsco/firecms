import { PreviewComponentProps } from "../../models";
import React from "react";
import { CustomChip } from "./CustomChip";
import { buildEnumLabel } from "../../models/builders";


export function NumberPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<number>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumValues = property.config.enumValues;
        const label = buildEnumLabel(enumValues[value]);
        return <CustomChip colorKey={`${name}_${value}`}
                           label={label || value}
                           error={!enumValues[value]}
                           outlined={false}
                           small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
