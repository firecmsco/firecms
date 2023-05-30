import React, { useState } from "react";
import { FormControl, FormControlLabel, Switch } from "@mui/material";
import { fieldBackground, fieldBackgroundHover } from "../../util/field_colors";

type BooleanSwitchProps = {
    value: boolean,
    position?: "start" | "end",
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    label?: React.ReactNode,
    disabled?: boolean,
    error?: boolean,
    autoFocus?: boolean,
    small?: boolean,
};

/**
 * Simple boolean switch.
 *
 */
export const BooleanSwitch = React.forwardRef(function SwitchFieldBinding({
                                                                              value,
                                                                              position = "end",
                                                                              onChange,
                                                                              error,
                                                                              label,
                                                                              autoFocus,
                                                                              disabled,
                                                                              small,
                                                                          }: BooleanSwitchProps, ref) {

    const [focus, setFocus] = useState<boolean>(autoFocus ?? false);
    return (
        <>
            <FormControl fullWidth>

                <FormControlLabel
                    sx={theme => ({
                        color: error ? theme.palette.error.main : (focus ? theme.palette.primary.main : theme.palette.text.secondary),
                        justifyContent: "space-between",
                        margin: 0,
                        width: "100%",
                        minHeight: small ? "48px" : "64px",
                        paddingLeft: small ? "8px" : "16px",
                        paddingRight: small ? "16px" : "24px",
                        boxSizing: "border-box",
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        flexDirection: position === "end" ? "row-reverse" : "row",
                        backgroundColor: fieldBackground(theme),
                        borderRadius: `${theme.shape.borderRadius}px`,
                        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                        "&:hover": {
                            backgroundColor: fieldBackgroundHover(theme)
                        }
                    })}
                    onClick={(e) => setFocus(true)}
                    labelPlacement={"start"}
                    checked={Boolean(value)}
                    inputRef={ref}
                    control={
                        <Switch
                            size={small ? "small" : "medium"}
                            type={"checkbox"}
                            color={"secondary"}
                            autoFocus={autoFocus}
                            disabled={disabled}
                            onFocus={(e) => setFocus(true)}
                            onBlur={(e) => setFocus(false)}
                            onChange={(evt) => {
                                setFocus(true);
                                onChange?.(evt);
                            }}/>
                    }
                    disabled={disabled}
                    label={label}
                />

            </FormControl>

        </>

    );
});
