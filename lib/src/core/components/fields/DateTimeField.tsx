import React from "react";

import {
    Box,
    IconButton,
    TextField
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
                           sx={(theme) => ({
                               height: small ? "48px" : "56px",
                               borderRadius: `${theme.shape.borderRadius}px`
                           })}
                           InputProps={{
                               ...params.InputProps,
                               sx: theme => ({
                                   height: small ? "48px" : "56px",
                                   borderRadius: `${theme.shape.borderRadius}px`,
                                   padding: small ? "0 0px" : undefined,
                               }),
                               disableUnderline: true,
                               endAdornment: clearable
                                   ? <Box
                                       sx={{
                                           pr: 2,
                                           gap: 2
                                       }}>
                                       <IconButton
                                           sx={{
                                               position: "absolute",
                                               right: "56px",
                                               top: "8px"
                                           }}
                                           onClick={(e) => onChange?.(null)}>
                                           <ClearIcon/>
                                       </IconButton>
                                       {params.InputProps?.endAdornment}
                                   </Box>
                                   : null
                           }}
                           variant={"filled"}/>
            )}
        onChange={onChange}
    />;
}
