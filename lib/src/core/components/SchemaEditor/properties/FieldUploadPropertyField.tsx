import React from "react";

import { Field, getIn, useFormikContext } from "formik";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";
import DebouncedTextField from "../../../../form/components/DebouncedTextField";
import { EnumValues } from "../../../../models";
import { CustomDialogActions } from "../../CustomDialogActions";
import { SmallSwitch } from "../../../../form/components/SmallSwitch";

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

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const storedValue = getIn(values, acceptedFiles);
    const fileTypesValue: string[] | undefined = Array.isArray(storedValue) ? storedValue : undefined;
    const allFileTypesSelected = !fileTypesValue || fileTypesValue.length === 0;
    const handleTypesChange = (event: SelectChangeEvent<string[] | undefined>) => {
        const { target: { value } } = event;
        console.log("qqq", value);
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
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
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
                    </Box>
                    <Box>
                        <Button variant="outlined"
                                sx={{
                                    height: "100%"
                                }}
                                onClick={() => setDialogOpen(true)}>
                            <SettingsIcon/>
                        </Button>
                    </Box>
                </Box>
            </Grid>

            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    <GeneralPropertyValidation/>
                </Paper>

            </Grid>

            <EnumEntryDialog open={dialogOpen}
                             baseStoragePath={baseStoragePath}
                             onClose={() => setDialogOpen(false)}/>
        </>
    );
}

function EnumEntryDialog({
                             open,
                             onClose,
                             baseStoragePath
                         }: {
    open: boolean;
    baseStoragePath: string;
    onClose: () => void;
}) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const metadata = `${baseStoragePath}.metadata`;
    const fileName = `${baseStoragePath}.fileName`;
    const storagePath = `${baseStoragePath}.storagePath`;
    const storeUrl = `${baseStoragePath}.storeUrl`;

    const fileNameValue = getIn(values, fileName) ?? "{file}";
    const storagePathValue = getIn(values, storagePath) ?? "/";

    return <Dialog
        maxWidth="xs"
        aria-labelledby="storage-edit-dialog"
        open={open}
        onBackdropClick={onClose}
    >

        <DialogContent>
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
                </Grid>
                <Grid item>
                    <Typography variant={"caption"}>
                        You can use the following placeholders in the file name
                        and storage path values:
                        <ul>
                            <li>{"{file} - Full file name"}</li>
                            <li>{"{file.name} - Name of the file without extension"}</li>
                            <li>{"{file.ext} - Extension of the file"}</li>
                            <li>{"{entityId} - Id of the entity"}</li>
                            <li>{"{propertyId} - Id of this property"}</li>
                            <li>{"{path} - Path of this entity"}</li>
                        </ul>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Field type="checkbox"
                               name={storeUrl}
                               label={"Save URL instead of storage path"}
                               component={SmallSwitch}/>
                </Grid>
                <Grid item>
                    <Typography variant={"caption"}>
                        Turn this setting on, if you prefer to save the download
                        URL of the uploaded file instead of the storage path.
                    </Typography>
                </Grid>
            </Grid>
        </DialogContent>

        <CustomDialogActions>
            <Button
                autoFocus
                variant="contained"
                onClick={onClose}
                color="primary">
                Ok
            </Button>
        </CustomDialogActions>

    </Dialog>
}
