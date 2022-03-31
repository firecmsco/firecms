import React from "react";

import { Field, getIn, useFormikContext } from "formik";
import {
    Button,
    Checkbox,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import DebouncedTextField from "../../form/components/DebouncedTextField";
import { SwitchControl } from "../../form/components/SwitchControl";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";
import {
    ArrayPropertyValidation
} from "./validation/ArrayPropertyValidation";

const fileTypes = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio files",
    "application/*": "Files (pdf, zip, csv, excel...)",
    "text/*": "Text files"
}

export function FieldUploadPropertyField({
                                             multiple,
                                             existing
                                         }: {
    multiple: boolean;
    existing: boolean;
}) {

    const { values, setFieldValue } = useFormikContext();

    const baseStoragePath = multiple ? "of.storage" : "storage";
    const acceptedFiles = `${baseStoragePath}.acceptedFiles`;

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const storagePath = `${baseStoragePath}.storagePath`;
    const storeUrl = `${baseStoragePath}.storeUrl`;

    const fileNameValue = getIn(values, fileName) ?? "{file}";
    const storagePathValue = getIn(values, storagePath) ?? "/";

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
                        <InputLabel id="file-types-label">
                            File types
                        </InputLabel>}

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
                                <Button size={"small"} onClick={(e) => {
                                    e.stopPropagation();
                                    return setFieldValue(acceptedFiles, [value]);
                                }}>
                                    Only
                                </Button>
                            </MenuItem>
                        ))}

                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12}>

                <ExpandablePanel title={
                    <Typography variant={"button"}>
                        Advanced
                    </Typography>}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Field name={fileName}
                                   as={DebouncedTextField}
                                   label={"File name"}
                                   size={"small"}
                                   value={fileNameValue}
                                   fullWidth/>
                        </Grid>
                        <Grid item xs={12}>
                            <Field name={storagePath}
                                   as={DebouncedTextField}
                                   label={"Storage path"}
                                   size={"small"}
                                   value={storagePathValue}
                                   fullWidth/>
                            <Typography variant={"caption"}>
                                <p>You can use the following placeholders in
                                    the file name
                                    and storage path values:</p>
                                <ul>
                                    <li>{"{file} - Full name of the uploaded file"}</li>
                                    <li>{"{file.name} - Name of the uploaded file without extension"}</li>
                                    <li>{"{file.ext} - Extension of the uploaded file"}</li>
                                    <li>{"{entityId} - ID of the entity"}</li>
                                    <li>{"{propertyId} - ID of this field"}</li>
                                    <li>{"{path} - Path of this entity"}</li>
                                </ul>
                            </Typography>
                            <Field type="checkbox"
                                   name={storeUrl}
                                   label={"Save URL instead of storage path"}
                                   disabled={existing}
                                   component={SwitchControl}/>
                            <br/>
                            <Typography variant={"caption"}>
                                Turn this setting on, if you prefer to save
                                the download
                                URL of the uploaded file instead of the
                                storage path.
                                You can only change this prop upon creation.
                            </Typography>
                        </Grid>
                    </Grid>
                </ExpandablePanel>

            </Grid>

            <Grid item xs={12}>

                <ExpandablePanel title={
                    <Typography variant={"button"}>
                        Validation
                    </Typography>}>
                    <Grid container spacing={2}>
                        {!multiple && <Grid item>
                            <GeneralPropertyValidation/>
                        </Grid>}
                        {multiple && <Grid item>
                            <ArrayPropertyValidation/>
                        </Grid>}
                    </Grid>
                </ExpandablePanel>

            </Grid>
        </>
    );
}
