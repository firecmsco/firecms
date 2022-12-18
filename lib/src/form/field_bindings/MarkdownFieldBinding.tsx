import React, { useCallback, useEffect, useRef } from "react";

import { styled } from "@mui/material/styles";

import { Box, FormControl, FormHelperText, Theme } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { FieldProps } from "../../types";

import { useClearRestoreValue } from "../../hooks";

const PREFIX = "MarkdownField";

const classes = {
    root: `${PREFIX}-root`
};

const StyledFormControl = styled(FormControl)((
    { theme }: {
        theme: Theme
    }
) => ({
    "&": {
        "& .w-md-editor-toolbar li > button": {
            color: theme.palette.text.secondary
        },
        "& .w-md-editor-toolbar li.active > button": {
            color: theme.palette.primary.main
        },
        "& .w-md-editor-text-pre, & .w-md-editor-text-pre .title, & .w-md-editor-text-pre .bold": {
            color: "inherit !important"
        },
        "& .wmde-markdown-color code.language-markdown": {
            color: "inherit"
        },
        "& .w-md-editor": {
            color: "inherit",
            boxShadow: "inherit",
            borderRadius: 6,
            backgroundColor: theme.palette.mode === "light" ? "rgb(240, 240, 240)" : "#272729"
        },
        "& .w-md-editor-toolbar": {
            borderBottom: "inherit",
            backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.09)"
        }
    }
}));

/**
 * Render a markdown field that allows edition and seeing the preview.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function MarkdownFieldBinding({
                                         propertyKey,
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
                                         shouldAlwaysRerender
                                     }: FieldProps<string>) {

    const ref = useRef<HTMLDivElement>(null);

    // This is a hack to make the editor resize based on content
    useEffect(() => {
        setTimeout(() => {
            ref.current?.firstElementChild?.removeAttribute("height");
            document.querySelector("#form_field_description > div > div.MarkdownField-root > div")?.removeAttribute("height");
            console.log("ref.current", ref.current);
        }, 1);
    }, [ref.current]);

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const updateValue = useCallback((newValue: string | undefined) => {
        if (!newValue) {
            setValue(
                null
            );
        } else {
            setValue(
                newValue
            );
        }
    }, [setValue]);

    return (
        <StyledFormControl
            required={property.validation?.required}
            error={showError}
            fullWidth>

            {!tableMode && <FormHelperText filled>
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <div className={classes.root} ref={ref}>
                <MDEditor
                    value={typeof value === "string" ? value : ""}
                    preview={"edit"}
                    height={300}
                    fullscreen={false}
                    commandsFilter={(cmd) => cmd.keyCommand === "fullscreen" ? false : cmd}
                    onChange={updateValue}
                />
            </div>

            <Box display={"flex"}>
                <Box flexGrow={1}>
                    {showError &&
                        typeof error === "string" &&
                        <FormHelperText>{error}</FormHelperText>}
                    {includeDescription &&
                        <FieldDescription property={property}/>}
                </Box>
            </Box>

        </StyledFormControl>
    );

}
