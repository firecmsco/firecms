import { Properties, PropertiesOrBuilders } from "../../types";
import { isPropertyBuilder } from "./entities";

export function makePropertiesEditable(properties: Properties) {
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        property.editable = true;
        if (property.dataType === "map" && property.properties) {
            makePropertiesEditable(property.properties as Properties);
        }
    });
}

export function makePropertiesNonEditable(properties: PropertiesOrBuilders): PropertiesOrBuilders {
    return Object.entries(properties).reduce((acc, [key, property]) => {
        if (!isPropertyBuilder(property) && property.dataType === "map" && property.properties) {
            const updated = { ...property, properties: makePropertiesNonEditable(property.properties as PropertiesOrBuilders) };
            acc[key] = updated;
        }
        if (isPropertyBuilder(property)) {
            acc[key] = property;
        } else {
            acc[key] = { ...property, editable: false };
        }
        return acc;
    }, {} as PropertiesOrBuilders);

}
