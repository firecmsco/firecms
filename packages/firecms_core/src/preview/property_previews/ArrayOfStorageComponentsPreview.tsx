import React from "react";

import { ArrayProperty, PreviewSize, Property, PropertyPreviewProps } from "@firecms/types";

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
                                                    property: property,
                                                    size
                                                }: PropertyPreviewProps<ArrayProperty>) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();

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
                            property={property.of as Property}
                            size={childSize}/>
                    </ErrorBoundary>
                )}
        </div>
    );
}
