import React from "react";

import { ErrorBoundary, resolvePropertyEnum } from "../../core";
import { ColorChip, EnumValuesChip } from "../components/ColorChip";
import { PropertyPreviewProps } from "../index";

/**
 * @category Preview components
 */
export function StringPropertyPreview({
                                  propertyKey,
                                  value,
                                  property,
                                  size
                              }: PropertyPreviewProps<string>): React.ReactElement {

    if (property.enumValues) {
        const enumKey = value;
        const resolvedProperty = resolvePropertyEnum(property);
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={resolvedProperty.enumValues}
            small={size !== "regular"}/>;
    } else if (property.previewAsTag) {
        return (
            <ErrorBoundary>
                <ColorChip
                    colorSeed={propertyKey ?? ""}
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
