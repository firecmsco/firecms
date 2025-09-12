import React from "react";

import { EnumValuesChip } from "../components/EnumValuesChip";
import { PreviewType, PropertyPreviewProps, StringProperty } from "@firecms/types";
import { UrlComponentPreview } from "../components/UrlComponentPreview";
import { ErrorBoundary } from "../../components";
import { Chip, cls, getColorSchemeForSeed } from "@firecms/ui";

/**
 * @group Preview components
 */
export function StringPropertyPreview({
                                          propertyKey,
                                          value,
                                          property,
                                          size
                                      }: PropertyPreviewProps<StringProperty>): React.ReactElement {

    if (property.enum) {
        const enumKey = value;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={property.enum as any}
            size={size}/>;
    } else if (property.previewAsTag) {
        const colorScheme = getColorSchemeForSeed(propertyKey ?? "");
        return (
            <ErrorBoundary>
                <Chip
                    colorScheme={colorScheme}
                    size={size}>
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
            ? <div className={cls("overflow-x-scroll overflow-hidden", size === "small" ? "text-sm" : "")}>
                {lines.map((str, index) =>
                    <React.Fragment key={`string_preview_${index}`}>
                        <span>{str}</span>
                        {index !== lines.length - 1 && <br/>}
                    </React.Fragment>)}
            </div>
            : (size === "small"
                    ? <span className={"text-sm"}>{value}</span>
                    : <>{value}</>
            );
    }
}
