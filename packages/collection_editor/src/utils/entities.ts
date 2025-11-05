import { isPropertyBuilder, Properties, PropertiesOrBuilders, Property, PropertyOrBuilder } from "@firecms/core";

export function editableProperty(property: PropertyOrBuilder): boolean {
    if (isPropertyBuilder(property)) {
        return false;
    } else {
        if (property.dataType === "array" && typeof property.of === "function")
            return false;
        else if (property.dataType === "array" && Array.isArray(property.of))
            return false;
        return property.editable === undefined ? true : Boolean(property.editable);
    }
}

export function removeNonEditableProperties(properties: PropertiesOrBuilders<any>): Properties {
    return Object.entries(properties)
        .filter(([_, property]) => editableProperty(property))
        .map(([key, propertyOrBuilder]) => {
            const property = propertyOrBuilder as Property;
            if (!editableProperty(property)) {
                return undefined;
            } else if (property.dataType === "map" && property.properties) {
                return {
                    [key]: {
                        ...property,
                        properties: removeNonEditableProperties(property.properties as PropertiesOrBuilders)
                    }
                };
            } else {
                return { [key]: property };
            }
        })
        .filter((e) => Boolean(e))
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties;
}
