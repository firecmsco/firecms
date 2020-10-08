import { Property } from "../models";


export type Order = "asc" | "desc" | undefined;

export function getCellAlignment(property: Property): "right" | "left" {
    return property.dataType === "number" || property.dataType === "timestamp" ? "right" : "left";
}
