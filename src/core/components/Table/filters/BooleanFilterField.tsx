import React from "react";
import { Checkbox, FormControlLabel, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { TableWhereFilterOp } from "../TableProps";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            width: "200px"
        },
        label: {
            width: "100%",
            height: "100%"
        }
    })
);

interface BooleanFieldProps {
    name: string,
    value?: [op: TableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: TableWhereFilterOp, newValue: any]) => void;
    title?: string;
}

export function BooleanFilterField({
                                       name,
                                       title,
                                       value,
                                       setValue
                                   }: BooleanFieldProps) {

    const classes = useStyles();

    function updateFilter(val?: boolean) {
        if (val !== undefined) {
            setValue(
                ["==", val]
            );
        } else {
            setValue(
                undefined
            );
        }
    }

    const valueSetToTrue = value && value[1];
    const valueSet = !!value;

    return (
        <FormControlLabel
            className={classes.formControl}
            labelPlacement={"end"}
            checked={valueSet && valueSetToTrue}
            control={
                <Checkbox
                    key={`filter-${name}`}
                    indeterminate={!valueSet}
                    onChange={(evt) => {
                        if (valueSetToTrue)
                            updateFilter(false);
                        else if (!valueSet)
                            updateFilter(true);
                        else
                            updateFilter(undefined);
                    }}
                />
            }
            label={!valueSet ? "No filter" : (valueSetToTrue ? `${title} is true` : `${title} is false`)}
        />
    );


}
