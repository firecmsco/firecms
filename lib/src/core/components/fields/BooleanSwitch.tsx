import React, { useState } from "react";
import { FormControl, FormControlLabel, Switch, useTheme } from "@mui/material";
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

    const theme = useTheme();
    const [focus, setFocus] = useState<boolean>(autoFocus ?? false);
    return (
        <>
            <FormControl fullWidth>

                <FormControlLabel
                    className={`${
                        error
                            ? "text-error-main"
                            : focus
                                ? "text-primary-main"
                                : "text-text-secondary"
                    } justify-between w-full ${
                        small ? "min-h-[48px]" : "min-h-[64px]"
                    } ${
                        small ? "pl-2" : "pl-4"
                    } ${
                        small ? "pr-4" : "pr-6"
                    } box-border relative inline-flex items-center ${
                        position === "end" ? "flex-row-reverse" : "flex-row"
                    } bg-[${fieldBackground(theme)}] rounded-[${theme.shape.borderRadius}px] transition-colors duration-200 ease-in hover:bg-[${fieldBackgroundHover(
                        theme
                    )}]`}
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
