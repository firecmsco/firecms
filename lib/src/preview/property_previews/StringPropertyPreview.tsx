import React from "react";

import { ErrorBoundary, resolvePropertyEnum } from "../../core";
import { ColorChip, EnumValuesChip } from "../components/ColorChip";
import { getColorSchemeForSeed } from "../../core/util/chip_utils";
import { PreviewType } from "../../types";
import { UrlComponentPreview } from "../components/UrlComponentPreview";
import { PropertyPreviewProps } from "../PropertyPreviewProps";

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
        const colorScheme = getColorSchemeForSeed(propertyKey ?? "");
        return (
            <ErrorBoundary>
                <ColorChip
                    colorScheme={colorScheme}
                    label={value}
                    small={size !== "regular"}
                />
            </ErrorBoundary>);
    } else if (property.url) {
        return (
            <UrlComponentPreview size={size}
                                 url={value}
                                 previewType={typeof property.url === "string" ? property.url as PreviewType : undefined}/>
        );
    } else {
        if (!value) return <></>;
        const lines = value.split("\n");
        return value && value.includes("\n")
            ? <div>
                {lines.map((str, index) =>
                    <React.Fragment key={`string_preview_${index}`}>
                        <span>{str}</span>
                        {index !== lines.length - 1 && <br/>}
                    </React.Fragment>)}
            </div>
            : <>{value}</>;
    }
}
