import React from "react";

import { Box, TextField as MuiTextField } from "@mui/material";
import DatePicker from "@mui/lab/DatePicker";
import DateTimePicker from "@mui/lab/DateTimePicker";

import { FieldProps } from "../../models";

import { FieldDescription } from "../index";
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
export function DateTimeFieldBinding({
                                  propertyKey,
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

    const PickerComponent = property.mode === undefined || property.mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    return (
        <>

            <PickerComponent
                clearable
                autoFocus={autoFocus}
                value={internalValue}
                label={
                    <LabelWithIcon property={property}/>
                }
                renderInput={(params) =>
                    (
                        <MuiTextField {...params}
                                      fullWidth
                                      sx={{
                                          minHeight: "64px"
                                      }}
                                      InputProps={{
                                          ...params.InputProps,
                                          sx: {
                                              minHeight: "64px"
                                          },
                                          endAdornment: <Box sx={{ pr: 2 }}>
                                              {params.InputProps?.endAdornment}
                                          </Box>
                                      }}
                                      error={showError}
                                      variant={"filled"}
                                      helperText={showError ? error : null}/>
                    )}
                disabled={disabled}
                onChange={(dateValue) => setValue(dateValue)}
            />

            {includeDescription &&
            <FieldDescription property={property}/>}

        </>
    );
}
