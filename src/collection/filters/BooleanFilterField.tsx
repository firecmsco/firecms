import { BooleanProperty } from "../../models";
import { Field } from "formik";
import {
    createStyles,
    FormControlLabel,
    makeStyles,
    Switch,
    Theme
} from "@material-ui/core";
import React from "react";
import { FieldProps } from "formik/dist/Field";

export const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            formControl: {
                width: "100%",
                minHeight: "64px",
                paddingRight: "32px"
            },
            label: {
                width: "100%",
                height: "100%"
            }
        })
);

interface BooleanFieldProps {
    name: string,
    property: BooleanProperty,
}

export default function BooleanFilterField({ name, property }: BooleanFieldProps) {

    const classes = useStyles();
    return (
        <Field
            name={`${name}`}
        >
            {({
                  field,
                  form: { setFieldValue },
                  ...props
              }: FieldProps) => {

                const [fieldOperation, fieldValue] = field.value ? field.value : ["==", false];

                function updateFilter(val: boolean) {
                    if (val) {
                        setFieldValue(
                            name,
                            ["==", val]
                        );
                    } else {
                        setFieldValue(
                            name,
                            undefined
                        );
                    }
                }

                return (
                        <FormControlLabel
                            className={classes.formControl}
                            labelPlacement={"end"}
                            checked={fieldValue}
                            control={
                                <Switch
                                    key={`filter-${name}`}
                                    type={"checkbox"}
                                    onChange={(evt) => updateFilter(evt.target.checked)}
                                />
                            }
                            label={undefined}
                        />
                );
            }}
        </Field>
    );

}
