import React from "react";

import { resolveArrayProperty } from "../../util/index.js";
import { ResolvedProperty } from "../../types/index.js";

import { useAuthController, useCustomizationController } from "../../hooks/index.js";
import { PreviewSize, PropertyPreviewProps } from "../PropertyPreviewProps.js";
import { PropertyPreview } from "../PropertyPreview.js";
import { ErrorBoundary } from "../../components/index.js";

/**
 * @group Preview components
 */
export function ArrayOfStorageComponentsPreview({
    propertyKey,
    // entity,
    value,
    property: inputProperty,
    size
}: PropertyPreviewProps<any[]>) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    if (!property) return null;

    if (Array.isArray(property.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStorageComponentsPreview");

    const childSize: PreviewSize = size === "medium" ? "medium" : "small";

    return (
        <div className={"flex flex-wrap gap-2"}>
            {value &&
                value.map((v, index) =>
                    <ErrorBoundary key={`preview_array_storage_${propertyKey}_${index}`}>
                        <PropertyPreview
                            propertyKey={propertyKey}
                            value={v}
                            // entity={entity}
                            property={property.of as ResolvedProperty<string>}
                            size={childSize} />
                    </ErrorBoundary>
                )}
        </div>
    );
}
