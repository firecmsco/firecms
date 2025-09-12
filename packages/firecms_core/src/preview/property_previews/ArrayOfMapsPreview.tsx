import React from "react";
import { ErrorBoundary } from "../../components";
import { useAuthController, useCustomizationController } from "../../hooks";
import { ArrayProperty, Property, PropertyPreviewProps } from "@firecms/types";
import { PropertyPreview } from "../PropertyPreview";
import { resolveArrayProperty } from "../../util";

/**
 * @group Preview components
 */
export function ArrayOfMapsPreview({
                                       propertyKey,
                                       value,
                                       property: inputProperty,
                                       size,
                                       // entity
                                   }: PropertyPreviewProps<ArrayProperty>) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    if (Array.isArray(property?.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property?.type !== "array" || !property.of || property.of.type !== "map")
        throw Error("Picked wrong preview component ArrayOfMapsPreview");

    const mapProperty = property.of;
    const properties = mapProperty.properties;
    if (!properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${propertyKey}`);
    }
    const values = value;
    const previewProperties: string[] | undefined = mapProperty.previewProperties;

    if (!values) return null;

    let mapProperties = previewProperties;
    if (!mapProperties || !mapProperties.length) {
        mapProperties = Object.keys(properties);
        if (size)
            mapProperties = mapProperties.slice(0, 3);
    }

    return (
        <div className="table-auto text-xs">
            <div>
                {values &&
                    values.map((v, index) => {
                        return (
                            <div key={`table_${v}_${index}`}
                                 className="border-b last:border-b-0 py-2">
                                {mapProperties && mapProperties.map(
                                    (key) => (
                                        <div
                                            key={`table-cell-${key as string}`}
                                            className="table-cell"
                                        >
                                            <ErrorBoundary>
                                                <PropertyPreview
                                                    propertyKey={key as string}
                                                    value={(v)[key]}
                                                    property={properties[key as string] as Property}
                                                    // entity={entity}
                                                    size={"small"}/>
                                            </ErrorBoundary>
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
