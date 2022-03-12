import React from "react";

import { getIn, useFormikContext } from "formik";
import {
    Checkbox,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent
} from "@mui/material";

const fileTypes = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio files",
    "application/*": "Files (pdf, zip, csv, excel...)",
    "text/*": "Text files"
}

export function FieldUploadPropertyField({
                                             multiple
                                         }: {
    multiple: boolean
}) {

    const { values, setFieldValue } = useFormikContext();

    const baseStoragePath = multiple ? "of.storage" : "storage";
    const acceptedFiles = `${baseStoragePath}.acceptedFiles`;

    const storedValue = getIn(values, acceptedFiles);
    const fileTypesValue: string[] | undefined = Array.isArray(storedValue) ? storedValue : undefined;
    const allFileTypesSelected = !fileTypesValue || fileTypesValue.length === 0;
    const handleTypesChange = (event: SelectChangeEvent<string[] | undefined>) => {
        const { target: { value } } = event;
        if (!value) setFieldValue(acceptedFiles, undefined);
        else if (value.includes("all")) setFieldValue(acceptedFiles, undefined);
        else if (value.length >= Object.keys(fileTypes).length) setFieldValue(acceptedFiles, undefined);
        else if (allFileTypesSelected)
            setFieldValue(acceptedFiles, Object.keys(fileTypes).filter((v) => !value.includes(v)));
        else setFieldValue(acceptedFiles, value);
    };

    return (
        <>

            <Grid item xs={12}>
                <FormControl fullWidth>
                    {!allFileTypesSelected &&
                        <InputLabel id="file-types-label">File
                            types</InputLabel>}

                    <Select
                        labelId="file-types-label"
                        multiple
                        name={acceptedFiles}
                        value={fileTypesValue ?? []}
                        onChange={handleTypesChange}
                        label={allFileTypesSelected ? undefined : "Allowed file types"}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected || selected.length === 0) return "All file types allowed";
                            return selected.map((v: string) => fileTypes[v])
                                .filter((v: string) => Boolean(v))
                                .join(", ");
                        }}>
                        <MenuItem key={"all"} value={"all"}>
                            <Checkbox
                                checked={!fileTypesValue}/>
                            <ListItemText primary={"All"}/>
                        </MenuItem>
                        {Object.entries(fileTypes).map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                <Checkbox
                                    checked={allFileTypesSelected || fileTypesValue.indexOf(value) > -1}/>
                                <ListItemText primary={label}/>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

        </>
    );
}

