import React from "react";

import { TextField as MuiTextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { FieldProps } from "../../models";

import { FieldDescription } from "../../form";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";

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
                autoFocus={autoFocus}
                value={internalValue}
                label={
                    <LabelWithIcon property={property}/>
                }
                renderInput={(props:any) => (
                    <MuiTextField {...props}
                                  fullWidth
                                  InputProps={{
                                      ...props.InputProps,
                                      sx: {
                                          minHeight: "64px"
                                      }
                                  }}
                                  error={showError}
                        // format={dateFormat}
                                  variant={"filled"}
                                  helperText={showError ? error : null}/>
                )}
                disabled={disabled}
                onChange={(dateValue:any) => {
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
