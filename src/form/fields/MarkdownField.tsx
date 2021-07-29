import React from "react";

import {
    Box,
    createStyles,
    FormControl,
    FormHelperText,
    makeStyles,
    Theme
} from "@material-ui/core";
import MDEditor from "@uiw/react-md-editor";

import { FieldProps } from "../../models";
import { FieldDescription } from "../../form/components";
import LabelWithIcon from "../components/LabelWithIcon";

import { useClearRestoreValue } from "../../hooks";


interface MarkDownFieldProps extends FieldProps<string> {
}

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "& .w-md-editor-toolbar": {
                backgroundColor: "rgba(0, 0, 0, 0.09)"
            }
        }
    })
);

/**
 * Render a markdown field that allows edition and seeing the preview.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export default function MarkDownField({
                                          name,
                                          value,
                                          setValue,
                                          error,
                                          showError,
                                          disabled,
                                          autoFocus,
                                          touched,
                                          property,
                                          tableMode,
                                          includeDescription,
                                          context,
                                          dependsOnOtherProperties
                                      }: MarkDownFieldProps) {

    const classes = useStyles();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const updateValue = (newValue: string | undefined) => {
        if (!newValue) {
            setValue(
                null
            );
        } else {
            setValue(
                newValue
            );
        }
    };

    return (

        <FormControl
            required={property.validation?.required}
            error={showError}
            fullWidth>

            {!tableMode && <FormHelperText filled
                                           required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>}

            <div className={classes.root}>
                <MDEditor
                    value={value}
                    preview={"edit"}
                    onChange={(value) => updateValue(value)}
                />
            </div>

            <Box display={"flex"}>
                <Box flexGrow={1}>
                    {showError
                    && typeof error === "string"
                    && <FormHelperText>{error}</FormHelperText>}
                    {includeDescription &&
                    <FieldDescription property={property}/>}
                </Box>
            </Box>

        </FormControl>
    );

}
