import React from "react";
import { resolveArrayProperty } from "../../util";
import { ResolvedProperty } from "../../types";
import { useCustomizationController } from "../../hooks";
import { PreviewSize, PropertyPreviewProps } from "../PropertyPreviewProps";
import { PropertyPreview } from "../PropertyPreview";
import { cn, defaultBorderMixin } from "@firecms/ui";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE } from "../../util/common";
import { ErrorBoundary } from "../../components";

/**
 * @group Preview components
 */
export function ArrayOneOfPreview({
                                      propertyKey,
                                      value,
                                      property: inputProperty,
                                      size,
                                      // entity
                                  }: PropertyPreviewProps<any[]>) {

    const customizationController = useCustomizationController();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: customizationController.propertyConfigs
    });

    if (property?.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    if (!property?.oneOf) {
        throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
    }

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "medium" ? "small" : "tiny";

    const typeField = property.oneOf.typeField ?? DEFAULT_ONE_OF_TYPE;
    const valueField = property.oneOf.valueField ?? DEFAULT_ONE_OF_VALUE;
    const properties = property.oneOf.properties;

    return (
        <div className={"flex flex-col"}>
            {values &&
                values.map((value, index) =>
                    <React.Fragment
                        key={"preview_array_" + value + "_" + index}>
                        <div className={cn(defaultBorderMixin, "m-1 border-b last:border-b-0")}>
                            <ErrorBoundary>
                                {value && <PropertyPreview
                                    propertyKey={propertyKey}
                                    value={value[valueField]}
                                    // entity={entity}
                                    property={(property.resolvedProperties[index] ?? properties[value[typeField]]) as ResolvedProperty<any>}
                                    size={childSize}/>}
                            </ErrorBoundary>
                        </div>
                    </React.Fragment>
                )}
        </div>
    );
}
