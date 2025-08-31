import { EnumValueConfig } from "@firecms/types";
import { CHIP_COLORS, ChipColorScheme, getColorSchemeForSeed } from "@firecms/ui";
import { getLabelOrConfigFrom } from "@firecms/common";

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
