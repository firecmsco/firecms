import { ChipColorScheme, EnumValueConfig, EnumValues } from "../../types";
import { CHIP_COLORS, getColorSchemeForSeed } from "./chip_utils";

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
    if (!key) return undefined;
    return enumValues.find((entry) => entry.id === key);
}

export function getColorScheme(enumValues: EnumValueConfig[], key: string | number): ChipColorScheme | undefined {
    const labelOrConfig = getLabelOrConfigFrom(enumValues, key);
    if (!labelOrConfig?.color)
        return getColorSchemeForSeed(key.toString());
    if (typeof labelOrConfig === "object" && "color" in labelOrConfig) {
        if (typeof labelOrConfig.color === "string")
            return CHIP_COLORS[labelOrConfig.color];
        if (typeof labelOrConfig.color === "object")
            return labelOrConfig.color;
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
