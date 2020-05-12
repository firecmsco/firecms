import * as React from "react";
import { useEffect } from "react";

import {
    Box,
    FormControl,
    FormHelperText,
    IconButton,
    LinearProgress,
    Paper,
    RootRef,
    Snackbar,
    Typography
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert/Alert";

import { uploadFile } from "../../firebase";
import firebase from "firebase";
import { formStyles } from "../../styles";
import {
    ArrayProperty,
    Property,
    StorageMeta,
    StringProperty
} from "../../models";
import { getIn } from "formik";

import { CMSFieldProps } from "../form_props";
import { useDropzone } from "react-dropzone";
import ClearIcon from "@material-ui/icons/Clear";
import PreviewComponent from "../../preview/PreviewComponent";

type StorageUploadFieldProps = CMSFieldProps<string | string[]> ;

/**
 * Internal representation of an item in the storage field.
 * It can have two states, having a storagePath set, which means the file has
 * been uploaded and it is rendered as a preview
 * Or have a pending file being uploaded.
 */
interface StorageFieldItem {
    storagePath?: string;
    file?: File;
}

export default function StorageUploadField({
                                               field,
                                               form: { errors, touched, setFieldValue },
                                               property,
                                               includeDescription
                                           }: StorageUploadFieldProps) {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const multipleFilesSupported = property.dataType === "array";

    const value = multipleFilesSupported ?
        (Array.isArray(field.value) ? field.value : []) :
        field.value;

    return (

        <FormControl fullWidth
                     required={property.validation?.required}
                     error={showError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || field.name}
            </FormHelperText>

            <StorageUpload value={value}
                           property={property}
                           onChange={(newValue) => setFieldValue(
                               field.name,
                               newValue
                           )}/>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );
}

interface StorageUploadProps {
    value: string | string[];
    property: StringProperty | ArrayProperty<string>;
    onChange: (value: string | string[] | null) => void;
}

export function StorageUpload({
                                  property,
                                  value,
                                  onChange
                              }: StorageUploadProps) {

    const multipleFilesSupported = property.dataType === "array";

    if (multipleFilesSupported && (property as ArrayProperty<any>).of.dataType !== "string") {
        throw Error("Storage field using array must be of data type string");
    }

    const storageMeta: StorageMeta | undefined = property.dataType === "string" ? property.storageMeta :
        property.dataType === "array" ? property.of.storageMeta :
            undefined;

    if (!storageMeta)
        throw Error("Storage meta must be specified");

    const classes = formStyles();

    const initialValue: StorageFieldItem[] = multipleFilesSupported ?
        (value as string[]).map(v => (
            {
                storagePath: v
            }
        )) : [{
            storagePath: value as string
        }];

    const [internalValue, setInternalValue] = React.useState<StorageFieldItem[]>(initialValue);

    function removeDuplicates(items: StorageFieldItem[]) {
        return items.filter(
            (v, i) => {
                return ((items.map((v) => v.storagePath).indexOf(v.storagePath) === i) || !v.storagePath)
                    && ((items.map((v) => v.file).indexOf(v.file) === i) || !v.file);
            }
        );
    }

    const onDrop = (acceptedFiles: File[]) => {

        let newInternalValue: StorageFieldItem[];
        if (multipleFilesSupported) {
            newInternalValue = [...internalValue, ...acceptedFiles.map(file => ({ file }))];
        } else {
            newInternalValue = [{ file: acceptedFiles[0] }];
        }

        // Remove either storage path or file duplicates
        newInternalValue = removeDuplicates(newInternalValue);

        setInternalValue(newInternalValue);
    };

    const onFileUploadComplete = (uploadedPath: string, file: File) => {
        console.log("onFileUploadComplete", uploadedPath, file);
        let item: StorageFieldItem | undefined = internalValue.find(entry => entry.file === file || entry.storagePath === uploadedPath);
        let newValue: StorageFieldItem[];
        if (!item) {
            item = {
                storagePath: uploadedPath,
                file: file
            };
            if (multipleFilesSupported)
                newValue = [...internalValue, item];
            else newValue = [item];
        } else {
            item.storagePath = uploadedPath;
            item.file = file;
            newValue = [...internalValue];
        }
        newValue = removeDuplicates(newValue);
        setInternalValue(newValue);

        const fieldValue = newValue.filter(e => !!e.storagePath).map(e => e.storagePath as string);

        if (multipleFilesSupported) {
            onChange(fieldValue);
        }else{
            onChange(fieldValue ? fieldValue[0] : null);
        }
    };

    const onClear = (clearedStoragePath: string) => {
        if (multipleFilesSupported) {
            const newValue: StorageFieldItem[] = internalValue.filter(v => v.storagePath !== clearedStoragePath);
            onChange(newValue.filter(v => !!v.storagePath).map(v => v.storagePath as string));
            setInternalValue(newValue);
        } else {
            onChange(null);
            setInternalValue([]);
        }
    };

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: storageMeta.acceptedFiles,
            onDrop: onDrop
        }
    );

    const { ref, ...rootProps } = getRootProps();

    return (


        <RootRef rootRef={ref}>

            <Paper elevation={0}
                   {...rootProps}
                   className={`${classes.dropZone} ${isDragActive ? classes.activeDrop : ""} ${isDragReject ? classes.rejectDrop : ""} ${isDragAccept ? classes.acceptDrop : ""}`}
                   variant={"outlined"}>

                <input {...getInputProps()} />

                <Box display="flex"
                     flexDirection="row"
                     flexWrap="wrap"
                     alignItems="center"
                     minHeight={220}>

                    {internalValue.map(entry => {
                        if (entry.storagePath) {
                            const renderProperty = multipleFilesSupported ? (property as ArrayProperty<string>).of : property;
                            return <StorageItemPreview
                                key={`storage_preview_${entry.storagePath}`}
                                property={renderProperty}
                                value={entry.storagePath}
                                onClear={onClear}/>;
                        } else if (entry.file) {
                            return <StorageUploadProgress
                                key={`storage_upload_${entry.file.name}`}
                                file={entry.file}
                                storagePath={storageMeta.storagePath}
                                onFileUploadComplete={(value, file) => {
                                    onFileUploadComplete(value, file);
                                }}/>;
                        }
                        return null;
                    })
                    }

                    <Box
                        flexGrow={1}
                        m={2}>
                        <Typography color={"textSecondary"}
                                    variant={"body2"}
                                    align={"center"}>
                            Drag 'n' drop some
                            files here, or click to
                            select files
                        </Typography>
                    </Box>

                </Box>

            </Paper>
        </RootRef>
    );

}


interface StorageUploadItemProps {
    storagePath: string;
    file: File,
    onFileUploadComplete: (value: string, file: File) => void;
}

export function StorageUploadProgress({
                                          storagePath,
                                          file,
                                          onFileUploadComplete
                                      }: StorageUploadItemProps) {

    const classes = formStyles();

    const [error, setError] = React.useState<string>();
    const [progress, setProgress] = React.useState<number>(-1);
    const [openErrorAlert, setOpenErrorAlert] = React.useState<boolean>(false);

    useEffect(() => {
        if (file)
            upload(file);
    }, []);

    function upload(file: File) {

        setError(undefined);
        setProgress(0);

        const uploadTask = uploadFile(file, storagePath);
        uploadTask.on("state_changed", (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(currentProgress);
            console.debug("Upload is " + currentProgress + "% done");
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.debug("Upload is paused");
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.debug("Upload is running");
                    break;
            }
        }, (e: any) => {
            console.error("Upload error", e);
            setError(e.message);
            setProgress(-1);
            setOpenErrorAlert(true);
        }, () => {
            const fullPath = uploadTask.snapshot.ref.fullPath;
            setProgress(-1);
            onFileUploadComplete(fullPath, file);
        });
    }

    const handleCloseErrorAlert = (event?: React.SyntheticEvent, reason?: string) => {
        setOpenErrorAlert(false);
    };

    return (

        <React.Fragment>

            <Box ml={2} mt={2} mb={2}>
                <Paper elevation={0}
                       className={classes.uploadItem}
                       variant={"outlined"}>

                    {progress > -1 &&
                    <LinearProgress variant="indeterminate"
                                    value={progress}/>}

                    {error && <p>Error uploading file: {error}</p>}

                </Paper>
            </Box>


            <Snackbar open={openErrorAlert} autoHideDuration={3000}
                      onClose={handleCloseErrorAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseErrorAlert}
                          severity="error">
                    {error}
                </MuiAlert>
            </Snackbar>

        </React.Fragment>
    );

}

interface StorageItemPreviewProps {
    property: Property;
    value: string,
    onClear: (value: string) => void;
}

export function StorageItemPreview({
                                       property,
                                       value,
                                       onClear
                                   }: StorageItemPreviewProps) {

    const classes = formStyles();
    return (
        <Box ml={2} mt={2} mb={2} position={"relative"}>

            <Paper
                elevation={0}
                className={classes.uploadItem}
                variant={"outlined"}>

                <Box position={"absolute"} top={4} right={4}>
                    <IconButton
                        style={{ backgroundColor: "white" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            onClear(value);
                        }}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                </Box>

                {value &&
                <PreviewComponent value={value}
                                  property={property}
                                  small={false}/>}

            </Paper>

        </Box>
    );

}
