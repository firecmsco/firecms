import React from "react";
import { useInputStyles } from "./styles";
import { Box, TextField as MuiTextField, Typography } from "@mui/material";
import { TimestampProperty } from "../../../../../models";
import DateTimePicker from "@mui/lab/DateTimePicker";
import { EmptyValue, TimestampPreview } from "../../../../../preview";

export function TableDateField(props: {
    name: string;
    error: Error | undefined;
    internalValue: Date | undefined | null;
    updateValue: (newValue: (Date | null)) => void;
    focused: boolean;
    disabled: boolean;
    property: TimestampProperty;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        disabled,
        error,
        internalValue,
        setPreventOutsideClick,
        updateValue,
        property
    } = props;

    const handleOpen = () => {
        setPreventOutsideClick(true);
    };

    const handleClose = () => {
        setPreventOutsideClick(false);
    };

    const classes = useInputStyles();

    return (
        <Box display={"flex"} alignItems={"center"}>

            <Box flexGrow={1}>
                {internalValue &&
                <Typography variant={"body2"}>
                    <TimestampPreview value={internalValue}
                                      property={property}
                                      size={"regular"}/>
                </Typography>}
                {!internalValue && <EmptyValue/>}
            </Box>

            <Box width={40}>
                <DateTimePicker
                    clearable
                    disabled={disabled}
                    renderInput={(props) => (
                        <MuiTextField
                            {...props}
                            style={{
                                height: "100%"
                            }}
                            variant={"standard"}
                            error={Boolean(error)}
                            InputProps={{
                                ...props.InputProps,
                                classes: {
                                    input: classes.hidden
                                },
                                disableUnderline: true
                            }}
                        />
                    )}
                    InputAdornmentProps={{
                        style: {
                            fontSize: "small",
                            height: 26
                        }
                    }}
                    onOpen={handleOpen}
                    onClose={handleClose}
                    value={internalValue ?? null}
                    onChange={(dateValue: Date | null) => {
                        updateValue(dateValue);
                    }}
                />
            </Box>
        </Box>
    );
}
