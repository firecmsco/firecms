import { Properties } from "../../types";

export function makePropertiesEditable(properties: Properties) {
    Object.keys(properties).forEach((key) => {
        const property = properties[key];
        property.editable = true;
        if (property.dataType === "map" && property.properties) {
            makePropertiesEditable(property.properties as Properties);
        }
    });
}
