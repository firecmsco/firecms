import {
    createStyles,
    FormControl,
    FormControlLabel,
    FormHelperText,
    makeStyles,
    Switch,
    Theme
} from "@material-ui/core";
import React from "react";
import { CMSFieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { useClearRestoreValue } from "../useClearRestoreValue";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            width: "100%",
            minHeight: "64px",
            paddingRight: "32px"
        },
        label: {
            width: "100%",
            height: "100%"
        }
    })
);


type SwitchFieldProps = CMSFieldProps<boolean>;


export default React.forwardRef(function SwitchField({
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

    return (
        <FormControl
            fullWidth
            error={showError}>
            <div
                className={"MuiFilledInput-root MuiFilledInput-underline MuiInputBase-formControl"}>
                <FormControlLabel
                    className={classes.formControl}
                    labelPlacement={"start"}
                    checked={!!value}
                    inputRef={ref}
                    control={
                        <Switch
                            type={"checkbox"}
                            autoFocus={autoFocus}
                            disabled={disabled}
                            onChange={(evt) => {
                                setValue(
                                    evt.target.checked
                                );
                            }}/>
                    }
                    disabled={disabled}
                    label={
                        <div className={"MuiFormLabel-root"}
                             style={{ width: "100%", marginLeft: "-4px" }}>
                            <LabelWithIcon scaledIcon={true}
                                           property={property}/>
                        </div>}
                />
            </div>
            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{error}</FormHelperText>}

        </FormControl>

    );
});

