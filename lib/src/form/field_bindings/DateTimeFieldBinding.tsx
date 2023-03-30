import React, { useCallback } from "react";

import { Box, IconButton, TextField as MuiTextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ClearIcon from "@mui/icons-material/Clear";

import { FieldProps } from "../../types";

import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";

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
                                         includeDescription
                                     }: DateTimeFieldProps) {

    const internalValue = value || null;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    const PickerComponent = property.mode === undefined || property.mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    return (
        <>

            <PickerComponent
                autoFocus={autoFocus}
                value={internalValue}
                renderInput={(params) =>
                    (
                        <MuiTextField {...params}
                                      fullWidth
                                      sx={(theme) => ({
                                          minHeight: "64px",
                                          borderRadius: `${theme.shape.borderRadius}px`
                                      })}
                                      label={
                                          <LabelWithIcon
                                              icon={getIconForProperty(property)}
                                              title={property.name}/>
                                      }
                                      InputProps={{
                                          ...params.InputProps,
                                          sx: (theme) => ({
                                              minHeight: "64px",
                                              borderRadius: `${theme.shape.borderRadius}px`
                                          }),
                                          disableUnderline: true,
                                          endAdornment: <Box
                                              sx={{
                                                  pr: 2,
                                                  gap: 2
                                              }}>
                                              {property.clearable && <IconButton
                                                  sx={{
                                                      position: "absolute",
                                                      right: "56px",
                                                      top: "12px"
                                                  }}
                                                  onClick={handleClearClick}>
                                                  <ClearIcon/>
                                              </IconButton>}
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
