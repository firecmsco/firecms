import { Properties, PropertiesOrBuilders } from "../types/index.js";
import { isPropertyBuilder } from "./entities.js";

export function makePropertiesEditable(properties: Properties) {
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        if (property) {
            property.editable = true;
            if (property.dataType === "map" && property.properties) {
                makePropertiesEditable(property.properties as Properties);
            }
        }
    });
    return properties;
}
