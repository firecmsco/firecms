import {
    createStyles,
    FormControl,
    FormControlLabel,
    FormHelperText,
    makeStyles,
    Switch,
    Theme
} from "@material-ui/core";
import React from "react";
import { CMSFieldProps } from "../form_props";
import { getIn } from "formik";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

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


type SwitchFieldProps = CMSFieldProps<boolean>;


export default React.forwardRef(function SwitchField({
                                                         field,
                                                         form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                         property,
                                                         includeDescription,
                                                         createFormField,
                                                     }: SwitchFieldProps, ref) {

    const classes = useStyles();
    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (
        <FormControl
            fullWidth
            error={showError}>
            <div
                className={"MuiFilledInput-root MuiFilledInput-underline MuiInputBase-formControl"}>
                <FormControlLabel
                    className={classes.formControl}
                    labelPlacement={"start"}
                    checked={!!field.value}
                    inputRef={ref}
                    control={
                        <Switch
                            type={"checkbox"}
                            onChange={(evt) => {
                                setFieldTouched(field.name);
                                setFieldValue(
                                    field.name,
                                    evt.target.checked
                                );
                            }}/>
                    }
                    disabled={property.disabled || isSubmitting}
                    label={
                        <div className={"MuiFormLabel-root"}
                             style={{ width: "100%", marginLeft: "-4px" }}>
                            <LabelWithIcon scaledIcon={true}
                                           property={property}/>
                        </div>}
                />
            </div>
            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>

    );
});

