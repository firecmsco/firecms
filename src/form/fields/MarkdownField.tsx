import {
    Box,
    createStyles,
    FormControl,
    FormHelperText,
    makeStyles,
    Paper,
    Theme,
    Typography
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { Controlled as CodeMirror } from "react-codemirror2";
import ReactMarkdown from "react-markdown";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/base16-light.css";

require("codemirror/mode/markdown/markdown");

interface MarkDownFieldProps extends CMSFieldProps<string> {
}

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: { // hacky, could not load custom css file to create theme
            "& .cm-s-base16-light div.CodeMirror-selected": {
                background: "rgb(200 200 200)"
            },
            "& .cm-s-base16-light .CodeMirror-line::selection, .cm-s-base16-light .CodeMirror-line > span::selection, .cm-s-base16-light .CodeMirror-line > span > span::selection": {
                background: "rgb(200 200 200)"
            },
            "& .react-codemirror2 .cm-s-base16-light.CodeMirror": {
                backgroundColor: "rgb(230 230 230)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
                color: "currentColor",
                "&:hover": {
                    backgroundColor: "rgb(222 222 222)"
                }
            }
        },
        preview: {
            padding: theme.spacing(2)
        },
        previewGutter: {
            width: "28px",
            minWidth: "28px",
            background: "#f5f5f5"
        }
    })
);

export default function MarkDownField({
                                          name,
                                          value,
                                          setValue,
                                          error,
                                          showError,
                                          isSubmitting,
                                          autoFocus,
                                          touched,
                                          property,
                                          tableMode,
                                          includeDescription,
                                          entitySchema
                                      }: MarkDownFieldProps) {

    const classes = useStyles();

    const updateValue = (newValue: string) => {
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

    const disabled = isSubmitting;
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
                <CodeMirror
                    value={value}
                    options={{
                        mode: "markdown",
                        highlightFormatting: true,
                        theme: "base16-light",
                        lineNumbers: true,
                        lineWrapping: true,
                        readOnly: disabled,
                        autoFocus: autoFocus
                    }}
                    onBeforeChange={(editor, data, value) => {
                        updateValue(value);
                    }}
                    onChange={(editor, data, value) => {
                    }}
                />
            </div>

            {!tableMode && <Box mt={1}>
                <Paper variant={"outlined"}>
                    <Box display={"flex"}>
                        <Box className={classes.previewGutter}/>
                        <Box className={classes.preview}>
                            {value &&
                            <ReactMarkdown>{value}</ReactMarkdown>}
                            {!value &&
                            <Typography variant={"caption"}
                                        color={"textSecondary"}>
                                <p>Preview for {property.title}</p>
                            </Typography>}
                        </Box>
                    </Box>
                </Paper>
            </Box>}


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
