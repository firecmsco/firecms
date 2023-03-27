import React from "react";
import { styled } from "@mui/material/styles";
import { Checkbox, FormControlLabel, Theme } from "@mui/material";
import { TableWhereFilterOp } from "../../Table";

const PREFIX = "BooleanFilterField";

const classes = {
    formControl: `${PREFIX}-formControl`,
    label: `${PREFIX}-label`
};

const Root = styled(
    "div"
)((
    { theme }: {
        theme: Theme
    }
) => ({
    [`& .${classes.formControl}`]: {
        width: "200px"
    },

    [`& .${classes.label}`]: {
        width: "100%",
        height: "100%"
    }
}));

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
        <Root>
            <FormControlLabel
                className={classes.formControl}
                labelPlacement={"end"}
                checked={valueSet && valueSetToTrue}
                control={
                    <Checkbox
                        key={`filter-${name}`}
                        indeterminate={!valueSet}
                        onChange={(evt) => {
                            if (valueSetToTrue) {
                                updateFilter(false);
                            } else if (!valueSet) {
                                updateFilter(true);
                            } else {
                                updateFilter(undefined);
                            }
                        }}
                    />
                }
                label={!valueSet ? "No filter" : (valueSetToTrue ? `${title} is true` : `${title} is false`)}
            />
        </Root>
    );
}
