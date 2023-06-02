import React, { useCallback, useRef } from "react";
import { styled } from "@mui/system";

import { Box, InputLabel, useTheme } from "@mui/material";
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

    const theme = useTheme();
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
                       className={label ? "p-8 pt-32" : "p-2 px-3"}
                       small={small ?? false}
                       placeholder={placeholder}
                       autoFocus={autoFocus}
                       onFocus={() => setFocused(true)}
                       onBlur={() => setFocused(false)}
                       type={inputType}
                       value={Number.isNaN(value) ? "" : (value ?? "")}
                       onChange={onChange}/>;

    const inner = endAdornment
        ? <Box className="flex items-center justify-between">
            {input}
            <Box className="mr-2 my-1">{endAdornment}</Box>
        </Box>
        : input;

    return (
        <Box
            className="relative bg-[fieldBackground(theme)] rounded-[theme.shape.borderRadius] max-w-full min-h-[64px] hover:bg-[fieldBackgroundHover(theme)]"
            style={{ minHeight: small ? "48px" : "64px" }}>
            <InputLabel
                shrink={hasValue || focused}
                className={`absolute left-0 top-1 pointer-events-none ${!error ? (focused ? 'text-primary' : '') : 'text-error'}`}
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
