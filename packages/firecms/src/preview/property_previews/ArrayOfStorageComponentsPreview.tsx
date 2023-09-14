import React from "react";

import { ErrorBoundary, resolveArrayProperty } from "../../core";
import { ResolvedProperty } from "../../types";

import { useFireCMSContext } from "../../hooks";
import { PreviewSize, PropertyPreviewProps } from "../PropertyPreviewProps";
import { PropertyPreview } from "../PropertyPreview";

/**
 * @category Preview components
 */
export function ArrayOfStorageComponentsPreview({
                                                    propertyKey,
                                                    entity,
                                                    value,
                                                    property: inputProperty,
                                                    size
                                                }: PropertyPreviewProps<any[]>) {

    const fireCMSContext = useFireCMSContext();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (Array.isArray(property.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStorageComponentsPreview");

    const childSize: PreviewSize = size === "medium" ? "small" : "tiny";

    return (
        <div className={"flex flex-wrap"}>
            {value &&
                value.map((v, index) =>
                    <div className={"m-2"}
                         key={`preview_array_storage_${propertyKey}_${index}`}>
                        <ErrorBoundary>
                            <PropertyPreview
                                propertyKey={propertyKey}
                                value={v}
                                entity={entity}
                                property={property.of as ResolvedProperty<string>}
                                size={childSize}/>
                        </ErrorBoundary>
                    </div>
                )}
        </div>
    );
}
