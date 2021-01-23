import { PreviewComponentProps } from "../../models/preview_component_props";
import ErrorBoundary from "../../components/ErrorBoundary";
import React from "react";
import { CustomChip } from "./CustomChip";


export function EnumChipsPreview({
                                  name,
                                  value,
                                  property,
                                  size,
                                  entitySchema
                              }: PreviewComponentProps<string>):React.ReactElement {

    if (property.config?.enumValues) {
        return <>{property.config?.enumValues[value]}</>;
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
