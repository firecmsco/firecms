import React, { useEffect, useRef } from "react";
import { styled } from "@mui/system";

import { Box, InputLabel, Typography, useTheme } from "@mui/material";
import {
    fieldBackground,
    fieldBackgroundDisabled,
    fieldBackgroundHover
} from "../../../form/field_bindings/utils";
import TextareaAutosize from "./TextareaAutosize";

export type InputType = "text" | "number";

export function TextInput<T extends string | number>({
                                                         value,
                                                         setValue,
                                                         label,
                                                         inputType = "text",
                                                         multiline = false,
                                                         disabled,
                                                         error,
                                                         endAdornment
                                                     }: {
    inputType?: InputType,
    value: T,
    setValue: (value: T | null) => void,
    label: React.ReactNode,
    multiline?: boolean,
    disabled: boolean,
    error: boolean,
    endAdornment?: React.ReactNode
}) {

    const inputRef = useRef(null);
    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);

    const hasValue = value !== undefined && value !== null && value !== "";

    if (disabled) {
        return <DisabledTextField label={label}
                                  value={value}/>
    }

    const input = multiline
        ? <StyledTextArea ref={inputRef}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          value={value ?? ""}
                          onChange={(event) => {
                              setValue(event.target.value as T);
                          }}/>
        : <StyledInput ref={inputRef}
                       onFocus={() => setFocused(true)}
                       onBlur={() => setFocused(false)}
                       type={inputType}
                       value={value ?? ""}
                       onChange={(event) => {
                           setValue(event.target.value as T);
                       }}/>;

    const inner = endAdornment
        ? <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            {input}
            <Box sx={{
                mr: 2,
                my: 1
            }}>{endAdornment}</Box>
        </Box>
        : input;

    return (
        <Box
            sx={theme => ({
                position: "relative",
                background: fieldBackground(theme),
                borderRadius: `${theme.shape.borderRadius}px`,
                maxWidth: "100%",
                minHeight: "64px",
                "&:hover": {
                    backgroundColor: focused ? undefined : fieldBackgroundHover(theme)
                }
            })}>
            <InputLabel
                shrink={hasValue || focused}
                sx={{
                    position: "absolute",
                    left: 0,
                    top: "4px",
                    pointerEvents: "none",
                    color: theme => (!error ? (focused ? theme.palette.primary.main : undefined) : theme.palette.error.main)
                }}
                variant={"filled"}>{label}</InputLabel>

            {inner}
        </Box>
    );
}

const StyledInput = styled("input")({
    width: "100%",
    outlineWidth: 0,
    minHeight: "64px",
    fontSize: "16px",
    padding: "32px 12px 8px 12px",
    font: "inherit",
    letterSpacing: "inherit",
    color: "currentcolor",
    border: "0px",
    background: "none",
    height: "1.4375em",
    margin: "0px",
    WebkitTapHighlightColor: "transparent",
    display: "block",
    minWidth: "0px",
    animationName: "mui-auto-fill-cancel",
    animationDuration: "10ms"
});

const StyledTextArea = styled(TextareaAutosize)({
    width: "100%",
    outlineWidth: 0,
    resize: "none",
    minHeight: "64px",
    fontSize: "16px",
    padding: "32px 12px 8px 12px",
    font: "inherit",
    letterSpacing: "inherit",
    color: "currentcolor",
    border: "0px",
    background: "none",
    height: "1.4375em",
    margin: "0px",
    WebkitTapHighlightColor: "transparent",
    display: "block",
    minWidth: "0px",
    animationName: "mui-auto-fill-cancel",
    animationDuration: "10ms"
});

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    value: T
}) {
    return <Box sx={{
        position: "relative",
        background: fieldBackgroundDisabled,
        borderRadius: "4px",
        maxWidth: "100%",
        minHeight: "64px",
        color: theme => theme.palette.text.disabled
    }}>
        <InputLabel
            shrink={Boolean(value)}
            sx={{
                position: "absolute",
                left: 0,
                top: "4px",
                pointerEvents: "none"
            }}
            variant={"filled"}>{label}</InputLabel>
        <Box sx={{
            padding: "32px 12px 8px 12px"
        }}>
            <Typography variant={"body1"}>{value}</Typography>
        </Box>
    </Box>;
}
