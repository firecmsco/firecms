import { ChipColor, EnumValueConfig, EnumValues } from "../../models";

export function enumToObjectEntries(enumValues: EnumValues): [string | number, string | EnumValueConfig][] {
    return enumValues instanceof Map
        ? Array.from(enumValues.entries())
        : Object.entries<string | EnumValueConfig>(enumValues);
}

export function getLabelOrConfigFrom(enumValues: EnumValues, key: string | number): string | EnumValueConfig | undefined {
    return enumValues instanceof Map
        ? enumValues.get(key)
        : enumValues[key];
}

export function getColorSchemaKey(enumValues: EnumValues, key: string | number): ChipColor | undefined {
    const labelOrConfig = getLabelOrConfigFrom(enumValues, key);
    if (typeof labelOrConfig === "object" && "color" in labelOrConfig) {
        return labelOrConfig["color"];
    }
    return undefined;
}

export function isEnumValueDisabled(labelOrConfig?: string | EnumValueConfig) {
    return typeof labelOrConfig === "object" && (labelOrConfig as EnumValueConfig).disabled;
}


export function buildEnumLabel(
    labelOrConfig?: string | EnumValueConfig
): string | undefined {
    if (labelOrConfig === undefined)
        return undefined;
    if (typeof labelOrConfig === "object") {
        return labelOrConfig.label;
    } else {
        return labelOrConfig;
    }
}

