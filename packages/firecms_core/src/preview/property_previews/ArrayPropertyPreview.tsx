import React from "react";

import { ArrayProperty, PreviewSize, Property, PropertyPreviewProps } from "@firecms/types";
import { useAuthController, useCustomizationController } from "../../hooks";
import { PropertyPreview } from "../PropertyPreview";
import { cls, defaultBorderMixin } from "@firecms/ui";
import { ErrorBoundary } from "../../components";
import { resolveArrayProperties } from "@firecms/common";

/**
 * @group Preview components
 */
export function ArrayPropertyPreview({
                                         propertyKey,
                                         value,
                                         property: property,
                                         size
                                     }: PropertyPreviewProps<ArrayProperty>) {

    if (property.type !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    if (!property.of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${propertyKey}`);
    }

    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const resolvedProperties = resolveArrayProperties({
        propertyKey,
        property: property as ArrayProperty,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "medium" ? "medium" : "small";

    return (
        <div className="flex flex-col gap-2">
            {values &&
                values.map((value, index) => {
                        if (!resolvedProperties) {
                            throw Error("Property resolvedProperties is undefined");
                        }
                        const of: Property = resolvedProperties[index] ??
                            (resolvedProperties[index] ?? (Array.isArray(property.of) ? property.of[index] : property.of));
                        return of
                            ? <React.Fragment
                                key={"preview_array_" + index}>
                                <div className={cls(defaultBorderMixin, "m-1 border-b last:border-b-0")}>
                                    <ErrorBoundary>
                                        <PropertyPreview
                                            propertyKey={propertyKey}
                                            value={value}
                                            property={of}
                                            size={childSize}/>
                                    </ErrorBoundary>
                                </div>
                            </React.Fragment>
                            : null;
                    }
                )}
        </div>
    );
}
