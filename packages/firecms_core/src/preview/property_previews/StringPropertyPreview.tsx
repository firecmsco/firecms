import React from "react";

import { resolvePropertyEnum } from "../../util";
import { EnumValuesChip } from "../components/EnumValuesChip";
import { PreviewType } from "../../types";
import { UrlComponentPreview } from "../components/UrlComponentPreview";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { ErrorBoundary } from "../../components";
import { Chip, getColorSchemeForSeed } from "@firecms/ui";

/**
 * @group Preview components
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
            size={size !== "medium" ? "small" : "medium"}/>;
    } else if (property.previewAsTag) {
        const colorScheme = getColorSchemeForSeed(propertyKey ?? "");
        return (
            <ErrorBoundary>
                <Chip
                    colorScheme={colorScheme}
                    size={size !== "medium" ? "small" : "medium"}>
                    {value}
                </Chip>
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
            ? <div className={"overflow-x-scroll"}>
                {lines.map((str, index) =>
                    <React.Fragment key={`string_preview_${index}`}>
                        <span>{str}</span>
                        {index !== lines.length - 1 && <br/>}
                    </React.Fragment>)}
            </div>
            : <>
                {value}
            </>;
    }
}
