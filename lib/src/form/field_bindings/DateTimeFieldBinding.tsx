import React, { useCallback } from "react";

import { TextField as MuiTextField, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { FieldProps } from "../../types";

import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";
import { fieldBackground, fieldBackgroundHover } from "../../core/util/field_colors";
import { IconButton } from "../../components";
import { FieldHelperText } from "../components/FieldHelperText";
import { ClearIcon } from "../../icons/ClearIcon";

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

    const theme = useTheme();

    return (
        <>

            <PickerComponent
                autoFocus={autoFocus}
                value={internalValue}
                renderInput={(params) =>
                    (
                        <MuiTextField {...params}
                                      fullWidth
                                      className={`min-h-[64px] rounded-md ${fieldBackground(
                                          theme
                                      )} hover:${fieldBackgroundHover(theme)}`}
                                      label={
                                          <LabelWithIcon
                                              icon={getIconForProperty(property)}
                                              required={property.validation?.required}
                                              className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}
                                              title={property.name}/>
                                      }
                                      InputProps={{
                                          ...params.InputProps,
                                          sx: (theme) => ({
                                              minHeight: "64px",
                                              borderRadius: `${theme.shape.borderRadius}px`,
                                              backgroundColor: fieldBackground(theme),
                                              "&:hover": {
                                                  backgroundColor: fieldBackgroundHover(theme)
                                              }
                                          }),
                                          disableUnderline: true,
                                          endAdornment: <div
                                              className="pr-2 space-x-2">
                                              {property.clearable && <IconButton
                                                  className="absolute right-16 top-3"
                                                  onClick={handleClearClick}>
                                                  <ClearIcon/>
                                              </IconButton>}
                                              {params.InputProps?.endAdornment}
                                          </div>
                                      }}
                                      error={showError}
                                      variant={"filled"}
                                      helperText={showError ? error : null}/>
                    )}
                disabled={disabled}
                onChange={(dateValue) => setValue(dateValue)}
            />

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
