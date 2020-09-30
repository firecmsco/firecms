import { MediaType, StringProperty } from "../../models";
import { getIn } from "formik";
import {
    Box,
    FilledInput,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Switch,
    Typography
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "../form_props";
import PreviewComponent from "../../preview/PreviewComponent";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

interface TextFieldProps extends CMSFieldProps<string | number> {
    allowInfinity?: boolean
}

export default function TextField({
                                      name,
                                      field,
                                      form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                      property,
                                      includeDescription,
                                      allowInfinity,
                                      createFormField,
                                      ...props
                                  }: TextFieldProps) {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    let mediaType: MediaType | undefined;
    let multiline: boolean | number | undefined;
    if (property.dataType === "string") {
        mediaType = (property as StringProperty).config?.urlMediaType;
        multiline = (property as StringProperty).config?.multiline;
    }

    const rows: number | undefined = !!multiline ?
        (typeof multiline === "number" ? multiline as number : 4)
        : undefined;

    const value = field.value ? field.value : (property.dataType === "string" ? "" : field.value === 0 ? 0 : "");

    const valueIsInfinity = value === Infinity;
    const inputType = !valueIsInfinity && property.dataType === "number" ? "number" : undefined;

    const updateValue = (newValue: typeof value) => {

        setFieldTouched(field.name);

        if (!newValue) {
            setFieldValue(
                field.name,
                null
            );
        } else if (inputType === "number") {
            const numValue = parseFloat(newValue);
            setFieldValue(
                field.name,
                numValue
            );
        } else {
            setFieldValue(
                field.name,
                newValue
            );
        }
    };
    return (
        <React.Fragment>

            <FormControl
                required={property.validation?.required}
                error={showError}
                disabled={isSubmitting}
                fullWidth>

                <InputLabel style={{
                    marginLeft: "8px",
                    marginTop: "4px"
                }}>
                    <LabelWithIcon property={property}/>
                </InputLabel>

                <FilledInput
                    type={inputType}
                    multiline={!!multiline}
                    rows={rows}
                    value={valueIsInfinity ? "Infinity" : value}
                    {...props}
                    disabled={valueIsInfinity}
                    onChange={(evt) => {
                        updateValue(evt.target.value);
                    }}
                />

                <Box display={"flex"}>

                    <Box flexGrow={1}>
                        {showError && <FormHelperText
                            id="component-error-text">{fieldError}</FormHelperText>}

                        {includeDescription &&
                        <FieldDescription property={property}/>}
                    </Box>

                    {allowInfinity &&
                    <FormControlLabel
                        checked={valueIsInfinity}
                        labelPlacement={"start"}
                        control={
                            <Switch
                                size={"small"}
                                type={"checkbox"}
                                onChange={(evt) => {
                                    updateValue(
                                        evt.target.checked ? Infinity : undefined);
                                }}/>
                        }
                        disabled={property.disabled || isSubmitting}
                        label={
                            <Typography variant={"caption"}>
                                Set value to Infinity
                            </Typography>
                        }
                    />
                    }
                </Box>

            </FormControl>

            {mediaType && value &&
            <Box m={1}>
                <PreviewComponent name={field.name}
                                  value={value}
                                  property={property}
                                  small={false}/>
            </Box>
            }
        </React.Fragment>
    );

}
