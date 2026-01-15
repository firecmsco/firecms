import { isPropertyBuilder, Properties, Property } from "@firecms/core";

export function editableProperty(property: Property): boolean {
    if (isPropertyBuilder(property))
        return false;
    else {
        const eProperty = property as Property;
        if (eProperty.type === "array" && typeof eProperty.of === "function")
            return false;
        else if (property.type === "array" && Array.isArray(property.of))
            return false;
        return property.editable === undefined ? true : Boolean(property.editable);
    }
}

export function removeNonEditableProperties(properties: Properties): Properties {
    return Object.entries(properties)
        .filter(([_, property]) => editableProperty(property))
        .map(([key, property]) => {
            if (!editableProperty(property)) {
                return undefined;
            } else if (property.type === "map" && property.properties) {
                return {
                    [key]: {
                        ...property,
                        properties: removeNonEditableProperties(property.properties)
                    }
                };
            } else {
                return { [key]: property };
            }
        })
        .filter((e) => Boolean(e))
        .reduce((a, b) => ({ ...a, ...b }), {}) as Properties;
}
