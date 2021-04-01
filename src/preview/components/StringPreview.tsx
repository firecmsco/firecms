import { PreviewComponentProps } from "../../preview";
import ErrorBoundary from "../../components/ErrorBoundary";
import React from "react";
import { CustomChip, EnumValuesChip } from "./CustomChip";


export function StringPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<string>): React.ReactElement {

    if (property.config?.enumValues) {
        const enumKey = value;
        const enumValues = property.config.enumValues;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else if (property.config?.previewAsTag) {
        return (
            <ErrorBoundary>
                <CustomChip
                    colorSeed={name ?? ""}
                    label={value}
                    small={size !== "regular"}
                />
            </ErrorBoundary>);
    } else {
        return <>{value && (value.includes("\n") ? value.split("\n").map(str =>
            <div>{str}</div>) : value)}</>;
    }
}
