import React from "react";
import { ArrayProperty, PreviewSize, Property, PropertyPreviewProps } from "@firecms/types";
import { useAuthController, useCustomizationController } from "../../hooks";
import { PropertyPreview } from "../PropertyPreview";
import { cls, defaultBorderMixin } from "@firecms/ui";
import { ErrorBoundary } from "../../components";
import { DEFAULT_ONE_OF_TYPE, DEFAULT_ONE_OF_VALUE } from "@firecms/common";

/**
 * @group Preview components
 */
export function ArrayOneOfPreview({
                                      propertyKey,
                                      value,
                                      property: property,
                                      size,
                                      // entity
                                  }: PropertyPreviewProps<ArrayProperty>) {

    if (property.type !== "array")
        throw Error(
            `You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`
        )

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    if (property?.type !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    if (!property?.oneOf) {
        throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
    }

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "medium" ? "medium" : "small";

    const typeField = property.oneOf.typeField ?? DEFAULT_ONE_OF_TYPE;
    const valueField = property.oneOf.valueField ?? DEFAULT_ONE_OF_VALUE;
    const properties = property.oneOf.properties;

    return (
        <div className={"flex flex-col"}>
            {values &&
                values.map((value:any, index:number) =>
                    <React.Fragment
                        key={"preview_array_" + value + "_" + index}>
                        <div className={cls(defaultBorderMixin, "m-1 border-b last:border-b-0 py-2")}>
                            <ErrorBoundary>
                                {value && <PropertyPreview
                                    propertyKey={propertyKey}
                                    // @ts-ignore
                                    value={value[valueField]}
                                    // entity={entity}
                                    // @ts-ignore
                                    property={(property.resolvedProperties[index] ?? properties[value[typeField]]) as Property}
                                    size={childSize}/>}
                            </ErrorBoundary>
                        </div>
                    </React.Fragment>
                )}
        </div>
    );
}
