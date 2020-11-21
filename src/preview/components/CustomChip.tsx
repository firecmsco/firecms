import { Chip, withStyles } from "@material-ui/core";
import React from "react";
import { getColorSchemeForKey } from "../../util/chip_utils";

type EnumChipProps = {
    colorKey: string,
    label: string | number,
    error?: boolean,
    outlined?: boolean,
    small: boolean
};

export function CustomChip({ colorKey, label, error, outlined, small }: EnumChipProps) {

    const schema = getColorSchemeForKey(colorKey);

    const StyledChip = withStyles({
        root: {
            maxWidth: "100%",
            backgroundColor: error ? "#eee" : schema.color,
            fontWeight: 400
        },
        label: {
            color: error ? "red" : schema.text
        }
    })(Chip);

    return (
        <StyledChip
            size={small ? "small" : "medium"}
            key={"preview_chip_" + colorKey}
            variant={outlined ? "outlined" : "default"}
            label={label}
        />
    );
}
