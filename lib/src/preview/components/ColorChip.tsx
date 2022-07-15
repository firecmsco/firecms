import { Chip, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import {
    getColorSchemeForKey,
    getColorSchemeForSeed
} from "../../core/util/chip_utils";
import { ChipColor, EnumValueConfig } from "../../models";
import {
    buildEnumLabel,
    getColorSchemaKey,
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
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValues, enumKey?.toString()) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorSchemaKey = getColorSchemaKey(enumValues, enumKey.toString());
    return <ColorChip
        colorSeed={`${enumKey}`}
        colorSchemaKey={colorSchemaKey}
        label={label !== undefined ? label : enumKey}
        error={!label}
        outlined={false}
        small={small}/>;
}

export interface ColorChipProps {
    label: string;
    small?: boolean;
    colorSeed?: string;
    colorSchemaKey?: ChipColor;
    error?: boolean;
    outlined?: boolean;
}

/**
 * @category Preview components
 */
export function ColorChip({
                               colorSeed,
                               label,
                               colorSchemaKey,
                               error,
                               outlined,
                               small
                           }: ColorChipProps) {

    const theme = useTheme();
    const collection = useMemo(() =>
        colorSchemaKey
            ? getColorSchemeForKey(colorSchemaKey)
            : getColorSchemeForSeed(colorSeed ?? label), [colorSeed, colorSchemaKey, label]);

    return (
        <Chip
            sx={{
                maxWidth: "100%",
                backgroundColor: error ? "#eee" : collection.color,
                color: error ? "red" : collection.text,
                fontWeight: theme!.typography.fontWeightRegular
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "filled"}
            label={label}
        />
    );
}
