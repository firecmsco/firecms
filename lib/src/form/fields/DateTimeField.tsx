import React from "react";

import { TextField as MuiTextField } from "@mui/material";
import DateTimePicker from "@mui/lab/DateTimePicker";

import { FieldProps } from "../../models";

import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { formStyles } from "../styles";

type DateTimeFieldProps = FieldProps<Date>;

/**
 * Field that allows selecting a date
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function DateTimeField({
                                  name,
                                  value,
                                  setValue,
                                  autoFocus,
                                  error,
                                  showError,
                                  disabled,
                                  touched,
                                  property,
                                  includeDescription,
                                  shouldAlwaysRerender
                              }: DateTimeFieldProps) {


    const internalValue = value || null;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>

            <DateTimePicker
                clearable
                autoFocus={autoFocus}
                value={internalValue}
                label={
                    <LabelWithIcon property={property}/>
                }
                renderInput={(props) => (
                    <MuiTextField {...props}
                                  fullWidth
                                  sx={{
                                      minHeight: "64px"
                                  }}
                                  InputProps={{
                                      ...props.InputProps,
                                  }}
                                  error={showError}
                        // format={dateFormat}
                                  variant={"filled"}
                                  helperText={showError ? error : null}/>
                )}
                disabled={disabled}
                onChange={(dateValue) => {
                    return setValue(
                        dateValue
                    );
                }}
            />

            {includeDescription &&
            <FieldDescription property={property}/>}

        </>
    );
}
