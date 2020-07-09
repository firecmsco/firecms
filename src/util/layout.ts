import { Property } from "../models";

export function getColumnsForProperty(property: Property): 6 | 12 {

    if (property.config?.forceFullWidth)
        return 12;

    if (property.dataType === "array" && property.of.dataType === "string" && property.of.config?.enumValues) {
        return 6;
    }

    if (property.dataType === "array" || property.dataType === "map") {
        return 12;
    }

    if (property.dataType === "string" && property.config?.storageMeta) {
        return 12;
    }

    return 6;
}
