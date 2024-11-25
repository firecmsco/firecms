import React from "react";
import { FieldProps, PropertyFieldBinding, ResolvedProperties } from "@firecms/core";
import { IngredientMapping } from "@/app/common/types";
import { cls, IconButton, MoreHorizIcon } from "@firecms/ui";

export function IngredientMappingField({
                                           propertyKey,
                                           property,
                                           value,
                                           setValue,
                                           setFieldValue,
                                           customProps,
                                           touched,
                                           includeDescription,
                                           showError,
                                           error,
                                           isSubmitting,
                                           context, // the rest of the entity values here
                                           ...props
                                       }: FieldProps<IngredientMapping>) {

    if (property.dataType !== "map") {
        throw new Error("IngredientMappingField only supports map data type");
    }

    const properties = property.properties as ResolvedProperties;
    if (!properties) {
        throw new Error("IngredientMappingField requires properties");
    }

    const hasDescription = value.description;
    const hasOptional = value.optional;
    const [expanded, setExpanded] = React.useState(hasDescription || hasOptional);
    return (
        <div className={"mb-3 flex flex-col gap-1"}>
            <div className={"flex flex-row gap-2"}>
                {Object.entries(properties).map(([key, property], index) => {
                    if (key === "quantity" || key === "ingredient") {
                        return (
                            <div
                                key={key}
                                className={key === "quantity" ? "w-1/3" : "w-2/3"}>
                                <PropertyFieldBinding key={key}
                                                      minimalistView={true}
                                                      propertyKey={`${propertyKey}.${key}`}
                                                      property={property}
                                                      context={context}/>
                            </div>
                        );
                    }
                })}
                <IconButton>
                    <MoreHorizIcon onClick={() => setExpanded(!expanded)}/>
                </IconButton>
            </div>
            <div className={cls("flex ml-8 gap-2", expanded ? "visible" : "hidden")}>
                <div className={"w-1/3"}>
                    <PropertyFieldBinding minimalistView={true}
                                          size={"small"}
                                          propertyKey={`${propertyKey}.optional`}
                                          property={properties.optional}
                                          context={context}/>
                </div>
                <div className={"w-2/3"}>
                    <PropertyFieldBinding minimalistView={true}
                                          size={"small"}
                                          propertyKey={`${propertyKey}.description`}
                                          property={properties.description}
                                          context={context}/>
                </div>
            </div>
        </div>

    );

}
