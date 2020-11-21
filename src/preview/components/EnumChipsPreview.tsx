import { PreviewComponentProps } from "../PreviewComponentProps";
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
        return <React.Fragment>{property.config?.enumValues[value]}</React.Fragment>;
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
        return <React.Fragment>{value}</React.Fragment>;
    }
}
