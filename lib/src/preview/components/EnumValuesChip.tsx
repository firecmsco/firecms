import React from "react";
import { EnumValues } from "../../types";
import { buildEnumLabel, enumToObjectEntries, getColorScheme, getLabelOrConfigFrom } from "../../core/util/enums";
import { Chip } from "../../components/Chip";

export interface EnumValuesChipProps {
    enumValues?: EnumValues;
    enumKey: any;
    small: boolean;
    className?: string;
}

/**
 * @category Preview components
 */
export function EnumValuesChip({
                                   enumValues,
                                   enumKey,
                                   small,
                                   className
                               }: EnumValuesChipProps) {
    if (!enumValues) return null;
    const enumValuesConfig = enumToObjectEntries(enumValues);
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValuesConfig, enumKey) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorScheme = getColorScheme(enumValuesConfig, enumKey);
    return <Chip
        className={className}
        colorScheme={colorScheme}
        label={label !== undefined ? label : enumKey}
        error={!label}
        outlined={false}
        size={small ? "small" : "medium"}/>;
}
