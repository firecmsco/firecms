import { Properties, PropertiesOrBuilders } from "@firecms/types";
import { isPropertyBuilder } from "./entities";

export function makePropertiesEditable(properties: Properties) {
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        if (property) {
            property.editable = true;
            if (property.type === "map" && property.properties) {
                makePropertiesEditable(property.properties as Properties);
            }
        }
    });
    return properties;
}

export function makePropertiesNonEditable(properties: PropertiesOrBuilders): PropertiesOrBuilders {
    return Object.entries(properties).reduce((acc, [key, property]) => {
        if (!isPropertyBuilder(property) && property.type === "map" && property.properties) {
            const updated = {
                ...property,
                properties: makePropertiesNonEditable(property.properties as PropertiesOrBuilders)
            };
            acc[key] = updated;
        }
        if (isPropertyBuilder(property)) {
            acc[key] = property;
        } else {
            acc[key] = {
                ...property,
                editable: false
            };
        }
        return acc;
    }, {} as PropertiesOrBuilders);

}
