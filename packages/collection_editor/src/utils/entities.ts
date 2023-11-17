import { isPropertyBuilder, Properties, PropertiesOrBuilders, Property, PropertyOrBuilder } from "@firecms/core";

export function editableProperty(property: PropertyOrBuilder | PropertyOrBuilder): boolean {
    if (isPropertyBuilder(property))
        return false;
    if (isPropertyBuilder(property as PropertyOrBuilder))
        return false;
    else {
        const eProperty = property as Property;
        if (eProperty.dataType === "array" && typeof eProperty.of === "function")
            return false;
        else if (eProperty.dataType === "array" && Array.isArray(eProperty.of))
            return false;
        return Boolean(eProperty.editable);
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
