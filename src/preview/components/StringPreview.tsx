import { PreviewComponentProps } from "../../models/preview_component_props";
import ErrorBoundary from "../../components/ErrorBoundary";
import React from "react";
import { CustomChip } from "./CustomChip";


export function StringPreview({
                                  name,
                                  value,
                                  property,
                                  size,
                                  entitySchema
                              }: PreviewComponentProps<string>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumValues = property.config.enumValues;
        return <CustomChip colorKey={value}
                           label={enumValues[value] || value}
                           error={!enumValues[value]}
                           outlined={false}
                           small={size !== "regular"}/>;
    } else if (property.config?.previewAsTag) {
        return (
            <ErrorBoundary>
                <CustomChip
                    colorKey={name}
                    label={value}
                    small={size !== "regular"}
                />
            </ErrorBoundary>);
    } else {
        return <>{value}</>;
    }
}
