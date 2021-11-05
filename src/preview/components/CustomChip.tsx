import { Chip, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useMemo } from "react";
import {
    ChipColorSchema,
    getColorSchemeForKey,
    getColorSchemeForSeed
} from "../../core/util/chip_utils";
import { ChipColor, EnumValues } from "../../models";
import {
    buildEnumLabel,
    getColorSchemaKey,
    getLabelOrConfigFrom
} from "../../core/util/enums";

const useStyles = makeStyles<Theme, { schema: ChipColorSchema, error: any }>((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: "100%",
            backgroundColor: ({
                                  schema,
                                  error
                              }) => error ? "#eee" : schema.color
        },
        label: {
            color: ({ schema, error }) => error ? "red" : schema.text,
            fontWeight: theme.typography.fontWeightRegular
        }
    })
);


interface EnumValuesChipProps {
    enumValues: EnumValues;
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
    const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValues, enumKey.toString()) : undefined;
    const label = buildEnumLabel(enumValue);
    const colorSchemaKey = getColorSchemaKey(enumValues, enumKey.toString());
    return <CustomChip
        colorSeed={`${enumKey}`}
        colorSchemaKey={colorSchemaKey}
        label={label !== undefined ? label : enumKey}
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

    const schema = useMemo(() => colorSchemaKey ? getColorSchemeForKey(colorSchemaKey) : getColorSchemeForSeed(colorSeed), [colorSeed]);
    const classes = useStyles({ schema, error });

    return (
        <Chip
            classes={{
                root: classes.root,
                label: classes.label
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "filled"}
            label={label}
        />
    );
}
