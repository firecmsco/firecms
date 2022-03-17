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
    enumId: any;
    small: boolean;
}

/**
 * @category Preview components
 */
export function EnumValuesChip({
                                   enumValues,
                                   enumId,
                                   small
                               }: EnumValuesChipProps) {
    if (!enumValues) return null;
    const enumValue = enumId !== undefined ? getLabelOrConfigFrom(enumValues, enumId?.toString()) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorSchemaKey = getColorSchemaKey(enumValues, enumId.toString());
    return <CustomChip
        colorSeed={`${enumId}`}
        colorSchemaKey={colorSchemaKey}
        label={label !== undefined ? label : enumId}
        error={!label}
        outlined={false}
        small={small}/>;
}

interface EnumChipProps {
    colorSeed: string;
    colorSchemaKey?: ChipColor;
    label: string;
    error?: boolean;
    outlined?: boolean;
    small: boolean;
}

/**
 * @category Preview components
 */
export function CustomChip({
                               colorSeed,
                               label,
                               colorSchemaKey,
                               error,
                               outlined,
                               small
                           }: EnumChipProps) {

    const theme = useTheme();
    const schema = useMemo(() =>
        colorSchemaKey
            ? getColorSchemeForKey(colorSchemaKey)
            : getColorSchemeForSeed(colorSeed), [colorSeed, colorSchemaKey]);

    return (
        <Chip
            sx={{
                maxWidth: "100%",
                backgroundColor: error ? "#eee" : schema.color,
                color: error ? "red" : schema.text,
                fontWeight: theme!.typography.fontWeightRegular
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "filled"}
            label={label}
        />
    );
}
