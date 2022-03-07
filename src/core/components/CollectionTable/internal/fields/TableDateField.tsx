import React, { useCallback } from "react";
import { Box, TextField as MuiTextField, Theme } from "@mui/material";
import { TimestampProperty } from "../../../../../models";
import DateTimePicker from "@mui/lab/DateTimePicker";


import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useInputStyles = makeStyles<Theme>(theme => createStyles({
        hidden: {
            display: "none"
        }
    })
);

export function TableDateField(props: {
    name: string;
    error: Error | undefined;
    internalValue: Date | undefined | null;
    updateValue: (newValue: (Date | null)) => void;
    focused: boolean;
    disabled: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        disabled,
        error,
        internalValue,
        setPreventOutsideClick,
        updateValue
    } = props;

    const handleOpen = useCallback(() => {
        setPreventOutsideClick(true);
    }, []);

    const handleClose = useCallback(() => {
        setPreventOutsideClick(false);
    }, []);

    return (
        <Box display={"flex"} alignItems={"center"} width={"100%"}>

            <DateTimePicker
                value={internalValue ?? null}
                clearable
                disabled={disabled}
                onChange={(dateValue: Date | null) => {
                    updateValue(dateValue);
                }}
                renderInput={(params) =>
                    <MuiTextField {...params}
                                  variant={"standard"}
                                  error={Boolean(error)}
                                  style={{
                                      height: "100%"
                                  }}
                                  InputProps={{
                                      ...params.InputProps,
                                      style: { fontSize: 14 },
                                      disableUnderline: true
                                  }}
                    />}
                InputAdornmentProps={{
                    style: {
                        fontSize: "small",
                        height: 26
                    }
                }}
                onOpen={handleOpen}
                onClose={handleClose}
            />
        </Box>
    );
}
