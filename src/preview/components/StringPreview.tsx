import React from "react";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { CustomChip, EnumValuesChip } from "./CustomChip";
import { PreviewComponentProps } from "../internal";

/**
 * @category Preview components
 */
export function StringPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<string>): React.ReactElement {

    if (property.enumValues) {
        const enumKey = value;
        const enumValues = property.enumValues;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            small={size !== "regular"}/>;
    } else if (property.previewAsTag) {
        return (
            <ErrorBoundary>
                <CustomChip
                    colorSeed={name ?? ""}
                    label={value}
                    small={size !== "regular"}
                />
            </ErrorBoundary>);
    } else {
        return <>
            {value && (value.includes("\n")
                ? value.split("\n").map((str, index) =>
                    <div key={`string_preview_${index}`}>{str}</div>)
                : value)}
        </>;
    }
}
