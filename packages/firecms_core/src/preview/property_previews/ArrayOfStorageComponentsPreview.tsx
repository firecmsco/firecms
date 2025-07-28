import React from "react";

import { resolveArrayProperty } from "../../util";
import { ResolvedProperty } from "../../types";

import { useAuthController, useCustomizationController } from "../../hooks";
import { PreviewSize, PropertyPreviewProps } from "../PropertyPreviewProps";
import { PropertyPreview } from "../PropertyPreview";
import { ErrorBoundary } from "../../components";

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

    if (Array.isArray(property.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property.type !== "array" || !property.of || property.of.type !== "string")
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
                            size={childSize}/>
                    </ErrorBoundary>
                )}
        </div>
    );
}
