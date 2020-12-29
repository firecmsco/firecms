import { Chip, createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useMemo } from "react";
import { ChipColorSchema, getColorSchemeForKey } from "../../util/chip_utils";

const useStyles = makeStyles<Theme, { schema: ChipColorSchema, error: any }>((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: "100%",
            backgroundColor: ({ schema, error }) => error ? "#eee" : schema.color,
            fontWeight: 400
        },
        label: {
            color: ({ schema, error }) => error ? "red" : schema.text
        }
    })
);

type EnumChipProps = {
    colorKey: string,
    label: string | number,
    error?: boolean,
    outlined?: boolean,
    small: boolean
};

export function CustomChip({ colorKey, label, error, outlined, small }: EnumChipProps) {

    const schema = useMemo(() => getColorSchemeForKey(colorKey), [colorKey]);
    const classes = useStyles({ schema, error });

    return (
        <Chip
            classes={{
                root: classes.root,
                label: classes.label
            }}
            size={small ? "small" : "medium"}
            variant={outlined ? "outlined" : "default"}
            label={label}
        />
    );
}
