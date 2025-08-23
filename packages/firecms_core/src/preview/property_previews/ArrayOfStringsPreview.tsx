import React from "react";
import { PropertyPreviewProps, ResolvedStringProperty } from "@firecms/types";

import { resolveArrayProperty } from "../../util";
import { StringPropertyPreview } from "../../preview";
import { useAuthController, useCustomizationController } from "../../hooks";
import { ErrorBoundary } from "../../components";

/**
 * @group Preview components
 */
export function ArrayOfStringsPreview({
                                          propertyKey,
                                          value,
                                          property: inputProperty,
                                          // entity,
                                          size
                                      }: PropertyPreviewProps<string[]>) {
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
    if (!property.of || property.type !== "array" || property.of.type !== "string")
        throw Error("Picked wrong preview component ArrayOfStringsPreview");

    if (value && !Array.isArray(value)) {
        return <div>{`Unexpected value: ${value}`}</div>;
    }
    const stringProperty = property.of as ResolvedStringProperty;

    return (
        <div className="flex flex-col gap-2">
            {value &&
                value.map((v, index) =>
                    <div key={`preview_array_strings_${propertyKey}_${index}`}>
                        <ErrorBoundary>
                            <StringPropertyPreview propertyKey={propertyKey}
                                                   property={stringProperty}
                                                   value={v}
                                // entity={entity}
                                                   size={size}/>
                        </ErrorBoundary>
                    </div>
                )}
        </div>
    );
}
