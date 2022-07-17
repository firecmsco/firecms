import React from "react";
import { Box, TextField as MuiTextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export function TableDateField(props: {
    name: string;
    error: Error | undefined;
    mode?: "date" | "date_time";
    internalValue: Date | undefined | null;
    updateValue: (newValue: (Date | null)) => void;
    focused: boolean;
    disabled: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {

    const {
        disabled,
        error,
        mode,
        internalValue,
        updateValue
    } = props;

    const PickerComponent = mode === undefined || mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    return (
        <PickerComponent
            value={internalValue ?? null}
            disabled={disabled}
            onChange={(dateValue: Date | null) => {
                updateValue(dateValue);
            }}
            renderInput={(params) =>
                <MuiTextField {...params}
                              fullWidth
                              variant={"standard"}
                              error={Boolean(error)}
                                  style={{
                                      height: "100%"
                                  }}
                                  InputProps={{
                                      ...params.InputProps,
                                      style: { fontSize: 14 },
                                      disableUnderline: true,
                                      endAdornment: <Box sx={{ pr: 1 }}>
                                          {params.InputProps?.endAdornment}
                                      </Box>
                                  }}
                    />}
                InputAdornmentProps={{
                    style: {
                        fontSize: "small",
                        height: 26
                    }
                }}
            />
    );
}
