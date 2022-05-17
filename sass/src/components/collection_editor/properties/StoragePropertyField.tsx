import React from "react";

import { Field, getIn, useFormikContext } from "formik";
import {
    Box,
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
import {
    DebouncedTextField,
    ExpandablePanel,
    SwitchControl
} from "@camberi/firecms";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";
import { Settings } from "@mui/icons-material";

const fileTypes = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio files",
    "application/*": "Files (pdf, zip, csv, excel...)",
    "text/*": "Text files"
}

export function StoragePropertyField({
                                         multiple,
                                         existing,
                                         disabled
                                     }: {
    multiple: boolean;
    existing: boolean;
    disabled: boolean;
}) {

    const { values, setFieldValue } = useFormikContext();

    const baseStoragePath = multiple ? "of.storage" : "storage";
    const acceptedFiles = `${baseStoragePath}.acceptedFiles`;

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const storagePath = `${baseStoragePath}.storagePath`;
    const storeUrl = `${baseStoragePath}.storeUrl`;

    const fileNameValue = getIn(values, fileName) ?? "{rand}_{file}";
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

    const hasFilenameCallback = typeof fileNameValue === "function";
    const hasStoragePathCallback = typeof storagePathValue === "function";

    return (
        <>

            <Grid item xs={12}>

                <ExpandablePanel
                    padding={2}
                    title={
                        <Box sx={(theme) => ({
                            display: "flex",
                            flexDirection: "row",
                            color: theme.palette.text.secondary
                        })}>
                            <Settings/>
                            <Typography variant={"subtitle2"}
                                        sx={{
                                            ml: 2
                                        }}>
                            Advanced
                        </Typography>
                    </Box>
                }>

                    <Grid container spacing={2}>

                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={disabled}>

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
                                            <Button size={"small"}
                                                    onClick={(e) => {
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
                            <Field name={fileName}
                                   as={DebouncedTextField}
                                   label={"File name"}
                                   size={"small"}
                                   disabled={hasFilenameCallback || disabled}
                                   value={hasFilenameCallback ? "-" : fileNameValue}
                                   fullWidth/>
                        </Grid>
                        <Grid item xs={12}>
                            <Field name={storagePath}
                                   as={DebouncedTextField}
                                   label={"Storage path"}
                                   disabled={hasStoragePathCallback || disabled}
                                   size={"small"}
                                   value={hasStoragePathCallback ? "-" : storagePathValue}
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
                                    <li>{"{propertyKey} - ID of this field"}</li>
                                    <li>{"{path} - Path of this entity"}</li>
                                    <li>{"{rand} - Random value used to avoid name collisions"}</li>
                                </ul>
                            </Typography>
                            <Field type="checkbox"
                                   name={storeUrl}
                                   label={"Save URL instead of storage path"}
                                   disabled={existing || disabled}
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

                <ValidationPanel>
                    {!multiple && <Grid item>
                        <GeneralPropertyValidation disabled={disabled}/>
                    </Grid>}
                    {multiple && <Grid item>
                        <ArrayPropertyValidation disabled={disabled}/>
                    </Grid>}
                </ValidationPanel>

            </Grid>
        </>
    );
}
