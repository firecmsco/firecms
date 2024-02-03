import { unslugify } from "@firecms/core";

export function extractEnumFromValues(values: unknown[]) {
    if (!Array.isArray(values)) {
        return [];
    }
    const enumValues = values
        .map((value) => {
            if (typeof value === "string") {
                return ({ id: value, label: unslugify(value) });
            } else
                return null;
        }).filter(Boolean) as Array<{ id: string, label: string }>;
    enumValues.sort((a, b) => a.label.localeCompare(b.label));
    return enumValues;
}
