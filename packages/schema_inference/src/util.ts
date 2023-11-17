import { unslugify } from "@firecms/core";

export function extractEnumFromValues(values: string[]) {
    const enumValues = values
        .map((value) => ({ id: value, label: unslugify(value) }));
    enumValues.sort((a, b) => a.label.localeCompare(b.label));
    return enumValues;
}
