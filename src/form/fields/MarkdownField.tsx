import React from "react";

import { Box, FormControl, FormHelperText, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import MDEditor from "@uiw/react-md-editor";

import { FieldProps } from "../../models";
import { FieldDescription } from "../../form";
import { LabelWithIcon } from "../components";

import { useClearRestoreValue } from "../../hooks";


interface MarkDownFieldProps extends FieldProps<string> {
}

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "& .w-md-editor-toolbar li > button": {
                color: "inherit",
            },
            "& .w-md-editor-toolbar li.active > button": {
                color: theme.palette.primary.main,
            },
            "& .w-md-editor-text-pre": {
                color: "inherit",
            },
            "& .wmde-markdown-color code.language-markdown": {
                color: "inherit",
            },
            "& .w-md-editor": {
                color: "inherit",
                backgroundColor: theme.palette.mode === "light" ? "rgb(240, 240, 240)" : "#323232"
            },
            "& .w-md-editor-toolbar": {
                borderBottom: "inherit",
                backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.09)"
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
export function MarkdownField({
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
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <div className={classes.root}>
                <MDEditor
                    value={typeof value === "string" ? value : ""}
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
