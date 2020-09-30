import { Chip, withStyles } from "@material-ui/core";
import React from "react";
import { getColorSchemeForKey } from "../util/chip_utils";

type EnumChipProps = {
    value: string,
    label: string | number,
    error?: boolean,
    outlined?: boolean,
    small: boolean
};

export function CustomChip({ value, label, error, outlined, small }: EnumChipProps) {

    const schema = getColorSchemeForKey(value);

    const StyledChip = withStyles({
        root: {
            backgroundColor: schema.color
        },
        label: {
            color: error ? "red" : schema.text
        }
    })(Chip);

    return (
        <StyledChip
            size={small ? "small" : "medium"}
            key={"preview_chip_" + value}
            variant={outlined ? "outlined" : "default"}
            label={label}
        />
    );
}
