import React, { useState } from "react";
import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch
} from "@mui/material";

import { FieldProps } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { fieldBackground, fieldBackgroundHover } from "./utils";
import { getIconForProperty } from "../../core";

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
                                                                                   includeDescription
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
                    sx={theme => ({
                        color: focus ? theme.palette.primary.main : theme.palette.text.secondary,
                        justifyContent: "space-between",
                        margin: 0,
                        width: "100%",
                        minHeight: "64px",
                        paddingLeft: "16px",
                        paddingRight: "24px",
                        boxSizing: "border-box",
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
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
                        <LabelWithIcon icon={getIconForProperty(property)}
                                       title={property.name}/>
                    }
                />

                {includeDescription &&
                    <FieldDescription property={property}/>}

                {showError && <FormHelperText error={true}>{error}</FormHelperText>}

            </FormControl>

        </>

    );
});
