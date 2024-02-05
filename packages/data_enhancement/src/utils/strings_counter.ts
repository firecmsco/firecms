import { EntityValues, ResolvedProperties, ResolvedProperty } from "@firecms/core";

export function countStringCharacters(values: EntityValues<any>, properties: ResolvedProperties<any>) {
    let count = 0;

    for (const key in values) {
        const value = values[key];
        const property: ResolvedProperty = properties[key];

        if (property && !property.disabled) {
            if (property.dataType === "string" || property.dataType === "number") {
                count += String(value).length;
            } else if (property.dataType === "array" && Array.isArray(value) && property.of?.dataType === "string") {
                count += (value as string[]).reduce((acc, curr) => acc + (curr?.length ?? 0), 0);
            } else if (property.dataType === "map" && property.properties && typeof value === "object") {
                count += countStringCharacters(value, property.properties);
            }
        }
    }

    return count;
}
