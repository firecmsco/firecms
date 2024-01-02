import { DataType, getPropertyInPath, Properties, Property } from "@firecms/core";
import { DataTypeMapping } from "../types";

export function getPropertiesMapping(originProperties: Properties, newProperties: Properties): Record<string, DataTypeMapping> {

    function updateMapping(properties: Record<string, Property>, namespace?: string): Record<string, DataTypeMapping> {

        const dataMapping: Record<string, DataTypeMapping> = {};

        Object.keys(properties).forEach((key) => {

            const currentKey = namespace ? `${namespace}.${key}` : key;

            const property = getPropertyInPath(properties, key) as Property;
            const inferredProperty = getPropertyInPath(originProperties, currentKey) as Property;

            if (property) {
                if (property.dataType === "map" && property.properties) {
                    const nestedMapping = updateMapping(property.properties as Record<string, Property>, currentKey);
                    Object.keys(nestedMapping).forEach((nestedKey) => {
                        dataMapping[`${currentKey}.${nestedKey}`] = nestedMapping[nestedKey];
                    });
                    return;
                }

                if (inferredProperty) {

                    const from = inferredProperty.dataType;
                    const to = property.dataType;
                    let fromSubtype: DataType | undefined;
                    let toSubtype: DataType | undefined;

                    if (property.dataType === "array" && property.of) {
                        toSubtype = (property.of as Property).dataType;
                    }

                    if (inferredProperty?.dataType === "array" && inferredProperty?.of) {
                        fromSubtype = (inferredProperty.of as Property).dataType;
                    }

                    if (from !== to || fromSubtype !== toSubtype) {
                        dataMapping[key] = {
                            from,
                            to,
                            fromSubtype,
                            toSubtype
                        };
                    }
                }

            }

        });

        return dataMapping;
    }

    return updateMapping(newProperties);
}
