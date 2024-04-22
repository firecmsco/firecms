import { Properties, PropertiesOrBuilders, Property, } from "@firecms/core";
import { editableProperty } from "@firecms/collection_editor";

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
