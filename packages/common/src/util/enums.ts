import { EnumValueConfig, EnumValues } from "@firecms/types";

export function enumToObjectEntries(enumValues: EnumValues): EnumValueConfig[] {
    if (Array.isArray(enumValues)) {
        return enumValues;
    } else {
        return Object.entries(enumValues).map(([id, value]) => {
            if (typeof value === "string") {
                return {
                    id,
                    label: value
                }
            } else {
                return {
                    ...value,
                    id
                }
            }
        });
    }
}

export function getLabelOrConfigFrom(enumValues: EnumValueConfig[], key?: string | number): EnumValueConfig | undefined {
    if (key === null || key === undefined) return undefined;
    return enumValues.find((entry) => String(entry.id) === String(key));
}
