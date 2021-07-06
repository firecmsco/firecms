import { BooleanProperty, WhereFilterOp } from "../../../models";
import {
    Checkbox,
    createStyles,
    FormControlLabel,
    makeStyles,
    Theme
} from "@material-ui/core";
import React from "react";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            width: "200px",
        },
        label: {
            width: "100%",
            height: "100%"
        }
    })
);

interface BooleanFieldProps {
    name: string,
    value?: [op: WhereFilterOp, fieldValue: any];
    setValue: (value?: [op: WhereFilterOp, newValue: any]) => void;
    property: BooleanProperty,
}

export default function BooleanFilterField({
                                               name,
                                               property,
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
            checked={valueSet&& valueSetToTrue}
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
            label={!valueSet ? "No filter" : (valueSetToTrue ? `${property.title} is true` : `${property.title} is false`)}
        />
    );


}
