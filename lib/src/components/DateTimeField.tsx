import React from "react";

import { TextField, useTheme } from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IconButton } from "./IconButton";

export type DateTimeFieldProps = {
    value?: Date;
    onChange: (value: Date | null) => void;
    mode?: "date" | "date_time";
    clearable?: boolean;
    small?: boolean;
    disabled?: boolean;
}

export function DateTimeField({
                                  mode,
                                  value,
                                  onChange,
                                  disabled,
                                  clearable,
                                  small
                              }: DateTimeFieldProps) {

    const theme = useTheme();

    const PickerComponent = mode === undefined || mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    return <PickerComponent
        value={value ?? null}
        disabled={disabled}
        renderInput={(params) =>
            (
                <TextField {...params}
                           fullWidth
                           disabled={disabled}
                           className={`h-${small ? '12' : '14'} rounded-md`}
                           InputProps={{
                               ...params.InputProps,
                               sx: ({
                                   height: small ? "48px" : "56px",
                                   borderRadius: `${theme.shape.borderRadius}px`,
                                   padding: small ? "0 0px" : undefined,
                               }),
                               disableUnderline: true,
                               endAdornment: clearable
                                   ? <div
                                       className="pr-8 space-x-8">
                                       <IconButton
                                           className="absolute right-14 top-2"
                                           onClick={(e) => onChange?.(null)}>
                                           <ClearIcon/>
                                       </IconButton>
                                       {params.InputProps?.endAdornment}
                                   </div>
                                   : null
                           }}
                           variant={"filled"}/>
            )}
        onChange={onChange}
    />;
}
