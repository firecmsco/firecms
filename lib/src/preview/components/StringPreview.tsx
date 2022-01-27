import React from "react";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { CustomChip, EnumValuesChip } from "./CustomChip";
import { PreviewComponentProps } from "../internal";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";
import { resolvePropertyEnum } from "../../core/utils";

/**
 * @category Preview components
 */
export function StringPreview({
                                  name,
                                  value,
                                  property,
                                  size
                              }: PreviewComponentProps<string>): React.ReactElement {

    const schemaRegistry = useSchemaRegistry();
    if (property.enumValues) {
        const enumKey = value;
        const resolvedProperty = resolvePropertyEnum(property, schemaRegistry.enumConfigs);
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={resolvedProperty.enumValues}
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
