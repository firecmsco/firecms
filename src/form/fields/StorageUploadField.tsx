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
import renderPreviewComponent from "../../preview";
import { formStyles } from "../../styles";
import { Property, StorageMeta, StringProperty } from "../../models";
import { getIn } from "formik";

import { CMSFieldProps } from "./form_props";
import { useDropzone } from "react-dropzone";
import ClearIcon from "@material-ui/icons/Clear";

type StorageUploadFieldProps = CMSFieldProps<string> ;

export default function StorageUploadField({
                                               field,
                                               form: { errors, touched, setFieldValue },
                                               property,
                                               includeDescription
                                           }: StorageUploadFieldProps) {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (

        <FormControl fullWidth
                     required={property.validation?.required}
                     error={showError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || field.name}
            </FormHelperText>

            <StorageUpload value={field.value}
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
    value: string;
    // property: StringProperty | ArrayProperty<string>;
    property: StringProperty;
    onChange: (value: string | null) => void;
}

export function StorageUpload({
                                  property,
                                  value,
                                  onChange
                              }: StorageUploadProps) {

    if (!property.storageMeta) {
        throw Error("Wrong field used StorageFieldUpload");
    }

    const storageMeta: StorageMeta = property.storageMeta;

    const classes = formStyles();

    const [error, setError] = React.useState<string>();
    const [fileToUpload, setFileToUpload] = React.useState<File | undefined>();
    const [openErrorAlert, setOpenErrorAlert] = React.useState<boolean>(false);

    const onDrop = (acceptedFiles: File[]) => {
        console.log(acceptedFiles);
        setFileToUpload(acceptedFiles[0]);
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

    const handleCloseErrorAlert = (event?: React.SyntheticEvent, reason?: string) => {
        setOpenErrorAlert(false);
    };

    return (
        <React.Fragment>

            <Paper elevation={0}
                   className={`${isDragActive ? classes.activeDrop : ""} ${isDragReject ? classes.rejectDrop : ""} ${isDragAccept ? classes.acceptDrop : ""}`}
                   variant={"outlined"}>

                <Box display="flex"
                     flexDirection="row"
                     flexWrap="wrap"
                     alignItems="center"
                     minHeight={220}>

                    {(value || fileToUpload) && <Box ml={2} mt={2} mb={2}>
                        {value && <StorageItem property={property} value={value}
                                               onClear={() => onChange(null)}/>}

                        {fileToUpload && <Box>
                            <StorageUploadItem
                                file={fileToUpload}
                                storagePath={property.storageMeta.storagePath}
                                onChange={(value) => {
                                    setFileToUpload(undefined);
                                    onChange(value ? value : null);
                                }}/>
                        </Box>}
                    </Box>
                    }
                    <Box
                        {...rootProps}
                        className={`${classes.dropZone}`}
                        minHeight={220}
                        flexGrow={1}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        m={2}>
                        <RootRef rootRef={ref}>
                            <input {...getInputProps()} />
                            <Box m={"auto"}>
                                <Typography color={"textSecondary"}
                                            variant={"body2"}
                                            align={"center"}>
                                    Drag 'n' drop some
                                    files here, or click to
                                    select files
                                </Typography>
                            </Box>
                        </RootRef>

                    </Box>
                    {error &&
                    <FormHelperText error={true}>{error}</FormHelperText>}

                </Box>

            </Paper>

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


interface StorageUploadItemProps {
    storagePath: string;
    file?: File,
    onChange: (value?: string) => void;
}

export function StorageUploadItem({
                                      storagePath,
                                      file,
                                      onChange
                                  }: StorageUploadItemProps) {

    const classes = formStyles();

    const [error, setError] = React.useState<string>();
    const [progress, setProgress] = React.useState<number>(-1);

    useEffect(() => {
        if (file)
            upload(file);
    }, [file]);

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
            console.log(e);
            setError(e.message);
            setProgress(-1);
        }, () => {
            const fullPath = uploadTask.snapshot.ref.fullPath;
            setProgress(-1);
            onChange(fullPath);
        });
    }

    return (
        <Paper elevation={0} className={classes.uploadItem}
               variant={"outlined"}>

            {progress > -1 &&
            <LinearProgress variant="indeterminate"
                            value={progress}/>}

            {error && <p>Error uploading file: {error}</p>}

        </Paper>
    );

}

interface StorageItemProps {
    property: Property;
    value: string,
    onClear: () => void;
}

export function StorageItem({
                                property,
                                value,
                                onClear
                            }: StorageItemProps) {

    const classes = formStyles();
    return (

        <Box position={"relative"}>

            <Paper
                elevation={0}
                className={classes.uploadItem}
                variant={"outlined"}>

                <Box position={"absolute"} top={4} right={4}>
                    <IconButton
                        onClick={(event) => {
                            onClear();
                            event.preventDefault();
                        }}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                </Box>

                {value && renderPreviewComponent(value, property)}

            </Paper>

        </Box>
    );

}
