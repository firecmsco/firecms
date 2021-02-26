import { PreviewComponentProps } from "../../preview";
import ErrorBoundary from "../../components/ErrorBoundary";
import React from "react";
import { CustomChip } from "./CustomChip";
import { buildEnumLabel } from "../../models/builders";


export function StringPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<string>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumValues = property.config.enumValues;
        const label = buildEnumLabel(enumValues[value]);
        return <CustomChip colorKey={value}
                           label={label || value}
                           error={!label}
                           outlined={false}
                           small={size !== "regular"}/>;
    } else if (property.config?.previewAsTag) {
        return (
            <ErrorBoundary>
                <CustomChip
                    colorKey={name ?? ""}
                    label={value}
                    small={size !== "regular"}
                />
            </ErrorBoundary>);
    } else {
        return <>{value && (value.includes("\n") ? value.split("\n").map(str =>
            <div>{str}</div>) : value)}</>;
    }
}
