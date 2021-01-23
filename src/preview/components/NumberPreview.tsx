import { PreviewComponentProps } from "../../models/preview_component_props";
import React from "react";
import { CustomChip } from "./CustomChip";


export function NumberPreview({
                                  name,
                                  value,
                                  property,
                                  size,
                                  entitySchema
                              }: PreviewComponentProps<number>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumValues = property.config.enumValues;
        return <CustomChip colorKey={`${name}_${value}`}
                           label={enumValues[value] || value}
                           error={!enumValues[value]}
                           outlined={false}
                           small={size !== "regular"}/>;
    } else {
        return <>{value}</>;
    }
}
