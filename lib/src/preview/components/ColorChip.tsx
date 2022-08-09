import { Chip, useTheme } from "@mui/material";
import React from "react";
import { ChipColorScheme, EnumValueConfig } from "../../models";
import {
    buildEnumLabel,
    getColorScheme,
    getLabelOrConfigFrom
} from "../../core/util/enums";

export interface EnumValuesChipProps {
    enumValues: EnumValueConfig[] | undefined;
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
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValues, enumKey) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorScheme = getColorScheme(enumValues, enumKey.toString());
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

    return (
        <Chip
            sx={{
                maxWidth: "100%",
                backgroundColor: error || !colorScheme ? "#eee" : colorScheme.color,
                color: error || !colorScheme ? "red" : colorScheme.text,
                fontWeight: theme!.typography.fontWeightRegular
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "filled"}
            label={label}
        />
    );
}
