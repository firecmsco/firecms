import { Property } from "../models";

export function getColumnsForProperty(property: Property): "xs" | "sm" | "md" {

    if (property.dataType === "array" &&
        "dataType" in property.of &&
        property.of.dataType === "string" &&
        property.of.config?.enumValues) {
        return "xs";
    }

    if ( property.dataType === "map") {
        return "xs";
    }

    if (property.dataType === "array") {
        return property.readOnly || property.disabled? "xs" : "sm";
    }

    if (property.dataType === "string" && property.config?.storageMeta) {
        return "md";
    }

    if (property.dataType === "string" && (property.config?.multiline || property.config?.markdown)) {
        return "md";
    }

    return "xs";
}
