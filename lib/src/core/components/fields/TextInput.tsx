import React, { useCallback, useRef } from "react";
import { styled } from "@mui/system";

import { Box, InputLabel } from "@mui/material";
import { TextareaAutosize } from "./TextareaAutosize";
import { DisabledTextField } from "./DisabledTextField";
import { fieldBackground, fieldBackgroundHover } from "../../util/field_colors";

export type InputType = "text" | "number";

export function TextInput<T extends string | number>({
                                                         value,
                                                         onChange,
                                                         label,
                                                         inputType = "text",
                                                         multiline = false,
                                                         disabled,
                                                         error,
                                                         endAdornment,
                                                         autoFocus,
                                                         placeholder,
                                                         small
                                                     }: {
    inputType?: InputType,
    value: T,
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    label?: React.ReactNode,
    multiline?: boolean,
    disabled?: boolean,
    error?: boolean,
    endAdornment?: React.ReactNode,
    autoFocus?: boolean,
    placeholder?: string,
    small?: boolean
}) {

    const inputRef = useRef(null);
    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);

    const hasValue = value !== undefined && value !== null && value !== "";

    const numberInputOnWheelPreventChange = useCallback((e: any) => {
        e.target.blur()
        e.stopPropagation()
        setTimeout(() => {
            e.target.focus()
        }, 0)
    }, []);

    if (disabled) {
        return <DisabledTextField label={label}
                                  small={small}
                                  value={value}/>
    }

    const input = multiline
        ? <StyledTextArea ref={inputRef}
                          placeholder={placeholder}
                          autoFocus={autoFocus}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          value={value ?? ""}
                          onChange={onChange}/>
        : <StyledInput ref={inputRef}
                       onWheel={inputType === "number" ? numberInputOnWheelPreventChange : undefined}
                       sx={{
                           padding: label ? "32px 12px 8px 12px" : "8px 12px 8px 12px",
                       }}
                       small={small ?? false}
                       placeholder={placeholder}
                       autoFocus={autoFocus}
                       onFocus={() => setFocused(true)}
                       onBlur={() => setFocused(false)}
                       type={inputType}
                       value={Number.isNaN(value) ? "" : (value ?? "")}
                       onChange={onChange}/>;

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
                minHeight: small ? "48px" : "64px",
                "&:hover": {
                    backgroundColor: fieldBackgroundHover(theme)
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

const StyledInput = styled("input")(({ small }: {
    small: boolean
}) => ({
    width: "100%",
    outlineWidth: 0,
    minHeight: small ? "48px" : "64px",
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
    animationDuration: "10ms",
    "&::-webkit-inner-spin-button": {
        WebkitAppearance: "none",
        margin: 0
    }
}));

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
