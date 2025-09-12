import React from "react";

import { resolveArrayProperty } from "../../util";
import { ArrayProperty, PreviewSize, PropertyPreviewProps, ResolvedProperty } from "@firecms/types";

import { useAuthController, useCustomizationController } from "../../hooks";
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
                                                }: PropertyPreviewProps<ArrayProperty>) {

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

    if (!property.of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${propertyKey}`);
    }
    return (
        <div className={"flex flex-wrap gap-2"}>
            {value &&
                value.map((v, index) =>
                    <ErrorBoundary key={`preview_array_storage_${propertyKey}_${index}`}>
                        <PropertyPreview
                            propertyKey={propertyKey}
                            value={v}
                            property={property.of as ResolvedProperty}
                            size={childSize}/>
                    </ErrorBoundary>
                )}
        </div>
    );
}
