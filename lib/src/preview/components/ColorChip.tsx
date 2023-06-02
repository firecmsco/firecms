import { Chip, useTheme } from "@mui/material";
import React from "react";
import { ChipColorScheme, EnumValues } from "../../types";
import {
    buildEnumLabel,
    enumToObjectEntries,
    getColorScheme,
    getLabelOrConfigFrom
} from "../../core/util/enums";
import { getColorSchemeForSeed } from "../../core/util/chip_utils";

export interface EnumValuesChipProps {
    enumValues?: EnumValues;
    enumKey: any;
    small: boolean;
}

/**
 * @category Preview components
 */
export function EnumValuesChip({
                                   enumValues,
                                   enumKey,
                                   small
                               }: EnumValuesChipProps) {
    if (!enumValues) return null;
    const enumValuesConfig = enumToObjectEntries(enumValues);
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValuesConfig, enumKey) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorScheme = getColorScheme(enumValuesConfig, enumKey);
    return <ColorChip
        colorScheme={colorScheme}
        label={label !== undefined ? label : enumKey}
        error={!label}
        outlined={false}
        small={small}/>;
}

export interface ColorChipProps {
    label: string;
    small?: boolean;
    colorScheme?: ChipColorScheme;
    error?: boolean;
    outlined?: boolean;
}

/**
 * @category Preview components
 */
export function ColorChip({
                              label,
                              colorScheme,
                              error,
                              outlined,
                              small
                          }: ColorChipProps) {

    const theme = useTheme();

    const usedColorScheme = colorScheme ?? getColorSchemeForSeed(label);
    return (
        <Chip
            className={`w-full ${
                error || !usedColorScheme ? 'bg-gray-200 text-red-500' : ''
            } font-normal`}
            style={{
                backgroundColor: error || !usedColorScheme ? null : usedColorScheme.color,
                color: error || !usedColorScheme ? null : usedColorScheme.text,
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "filled"}
            label={label}
        />
    );
}
