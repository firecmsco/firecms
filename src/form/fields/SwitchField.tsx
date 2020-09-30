import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "../form_props";
import { getIn } from "formik";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

type SwitchFieldProps = CMSFieldProps<boolean>;


export default React.forwardRef(function SwitchField({
                                                         field,
                                                         form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                         property,
                                                         includeDescription,
                                                         createFormField,
                                                         ...props
                                                     }: SwitchFieldProps, ref) {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (
        <FormControl fullWidth error={showError}>

            <div
                className={"MuiFilledInput-root MuiFilledInput-underline MuiInputBase-formControl"}
                style={{
                    width: "100%"
                }}>
                <FormControlLabel
                    style={{
                        width: "100%",
                        minHeight: "64px",
                        paddingRight: "32px"
                    }}
                    labelPlacement={"start"}
                    checked={!!field.value}
                    inputRef={ref}
                    control={
                        <Switch
                            {...props}
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

