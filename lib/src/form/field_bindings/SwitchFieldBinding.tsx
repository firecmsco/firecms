import React, { useState } from "react";
import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch
} from "@mui/material";
import clsx from "clsx";

import { FieldProps } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";

const PREFIX = "SwitchField";

const classes = {
    formControl: `${PREFIX}-formControl`,
    focus: `${PREFIX}-focus`
};

type SwitchFieldProps = FieldProps<boolean>;

/**
 * Simple boolean switch.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export const SwitchFieldBinding = React.forwardRef(function SwitchFieldBinding({
                                                           propertyKey,
                                                           value,
                                                           setValue,
                                                           error,
                                                           showError,
                                                           autoFocus,
                                                           disabled,
                                                           touched,
                                                           property,
                                                           includeDescription,
                                                           shouldAlwaysRerender
                                                       }: SwitchFieldProps, ref) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const [focus, setFocus] = useState<boolean>(autoFocus);

    return (
        <>
            <FormControl fullWidth>

                <FormControlLabel
                    className={clsx(
                        {
                            [classes.focus]: focus
                        })}
                    sx={theme => ({
                        justifyContent: "space-between",
                        margin: 0,
                        width: "100%",
                        minHeight: "64px",
                        paddingLeft: "16px",
                        paddingRight: "24px",
                        color: "rgba(0, 0, 0, 0.87)",
                        boxSizing: "border-box",
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.09)",
                        borderTopLeftRadius: `${theme.shape.borderRadius}px`,
                        borderTopRightRadius: `${theme.shape.borderRadius}px`,
                        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                        "&::before": {
                            borderBottom: focus
                                ? (theme.palette.mode === "light"
                                    ? "1px solid rgba(255, 255, 255, 0.7)"
                                    : "1px solid rgba(0, 0, 0, 0.87)")
                                : (theme.palette.mode === "light"
                                    ? "1px solid rgba(0, 0, 0, 0.42)"
                                    : "1px solid rgba(255, 255, 255, 0.7)"),
                            left: 0,
                            bottom: 0,
                            content: "\"\\00a0\"",
                            position: "absolute",
                            right: 0,
                            transition: "border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            pointerEvents: "none"
                        },
                        "&::after": {
                            content: "\"\"",
                            transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                            left: 0,
                            bottom: 0,
                            position: "absolute",
                            right: 0,
                            transform: focus ? "scaleX(1)" : "scaleX(0)",
                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                            pointerEvents: focus ? "none" : undefined
                        },
                        "&:hover": {
                            backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)"
                        }
                    })}
                    onClick={(e) => setFocus(true)}
                    labelPlacement={"start"}
                    checked={Boolean(value)}
                    inputRef={ref}
                    control={
                        <Switch
                            type={"checkbox"}
                            color={"secondary"}
                            autoFocus={autoFocus}
                            disabled={disabled}
                            onFocus={(e) => setFocus(true)}
                            onBlur={(e) => setFocus(false)}
                            onChange={(evt) => {
                                setFocus(true);
                                setValue(
                                    evt.target.checked
                                );
                            }}/>
                    }
                    disabled={disabled}
                    label={
                            <LabelWithIcon
                                property={property}/>
                }
                />

                {includeDescription &&
                <FieldDescription property={property}/>}

                {showError && <FormHelperText>{error}</FormHelperText>}

            </FormControl>

        </>

    );
});
