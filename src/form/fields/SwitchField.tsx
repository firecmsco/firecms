import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch,
    Theme,
    Typography
} from "@mui/material";
import clsx from "clsx";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useState } from "react";
import { FieldProps } from "../../models";
import { FieldDescription } from "../../form/components";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
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
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            "&::before": {
                borderBottom: theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.42)" : "1px solid rgba(255, 255, 255, 0.7)",
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
                transform: "scaleX(0)",
                borderBottom: `2px solid ${theme.palette.primary.main}`
            },
            "&:hover": {
                backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)"
            }
        },
        focus: {
            "&::before": {
                borderBottom: theme.palette.mode === "light" ? "1px solid rgba(255, 255, 255, 0.7)" : "1px solid rgba(0, 0, 0, 0.87)"
            },
            "&::after": {
                transform: "scaleX(1)",
                pointerEvents: "none"
            }
        }
    })
);


type SwitchFieldProps = FieldProps<boolean>;

const SwitchFieldComponent = React.forwardRef(function({
                                                           name,
                                                           value,
                                                           setValue,
                                                           error,
                                                           showError,
                                                           autoFocus,
                                                           disabled,
                                                           touched,
                                                           property,
                                                           includeDescription,
                                                           dependsOnOtherProperties
                                                       }: SwitchFieldProps, ref) {

    const classes = useStyles();

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
                    className={clsx(classes.formControl,
                        {
                            [classes.focus]: focus
                        })}
                    onClick={(e) => setFocus(true)}
                    labelPlacement={"start"}
                    checked={!!value}
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
                        <Typography color={"textSecondary"}>
                            <LabelWithIcon

                                property={property}/>
                        </Typography>}
                />

                {includeDescription &&
                <FieldDescription property={property}/>}

                {showError && <FormHelperText>{error}</FormHelperText>}

            </FormControl>


        </>

    );
});

/**
 * Simple boolean switch.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export const SwitchField = (props: SwitchFieldProps) => {
    return <SwitchFieldComponent {...props}/>;
};

