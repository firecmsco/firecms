import * as React from "react";
import { useEffect, useState } from "react";

import {
    FormControl,
    FormHelperText,
    Grid,
    LinearProgress,
    Paper,
    Snackbar
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert/Alert";
import { DropzoneArea } from "material-ui-dropzone";

import { getDownloadURL, uploadFile } from "../../firebase";
import firebase from "firebase";
import renderPreviewComponent from "../../preview";
import { formStyles } from "../../styles";
import { StorageMeta, StringProperty } from "../../models";
import { getIn } from "formik";

import { CMSFieldProps } from "./form_props";

type StorageUploadFieldProps = CMSFieldProps<string> ;

export default function StorageUploadField({
                                               field,
                                               form: { errors, touched, setFieldValue },
                                               property,
                                               includeDescription,
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
    property: StringProperty;
    onChange: (value: string) => void;
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

    const [progress, setProgress] = React.useState<number>(-1);
    const [error, setError] = React.useState<string>();
    const [currentValue, setCurrentValue] = useState<string>(value);

    const classes = formStyles();

    const [url, setUrl] = React.useState<string>();
    const [openErrorAlert, setOpenErrorAlert] = React.useState<boolean>(false);

    useEffect(() => {
        if (value)
            getDownloadURL(value).then(function(downloadURL) {
                setUrl(downloadURL);
            });
    }, [value]);

    function upload(files: File[]) {

        setError(undefined);
        setProgress(0);

        // TODO: support multiple files for array type
        const uploadTask = uploadFile(files[0], storageMeta.storagePath);
        uploadTask.on("state_changed", (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(currentProgress);
            console.log("Upload is " + currentProgress + "% done");
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log("Upload is paused");
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log("Upload is running");
                    break;
            }
        }, (e: any) => {
            console.log(e);
            setError(e.message);
            setProgress(-1);
        }, () => {
            const fullPath = uploadTask.snapshot.ref.fullPath;
            setCurrentValue(fullPath);
            setProgress(-1);
            onChange(fullPath);
        });
    }

    function onDropRejected(files: any, evt: any) {
        console.log(evt);
        setError("Wrong file type");
        setOpenErrorAlert(true);
    }

    const handleCloseErrorAlert = (event?: React.SyntheticEvent, reason?: string) => {
        setOpenErrorAlert(false);
    };

    return (
        <React.Fragment>
            <Paper elevation={0} className={classes.paper} variant={"outlined"}>

                <Grid container spacing={2}>

                    <Grid item xs={12} sm={4}>
                        {progress > -1 &&
                        <LinearProgress variant="indeterminate"
                                        value={progress}/>}
                        {currentValue && renderPreviewComponent(currentValue, property)}
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <DropzoneArea
                            dropzoneText={""}
                            acceptedFiles={storageMeta.acceptedFiles}
                            initialFiles={url ? [url] : []}
                            onChange={upload}
                            onDropRejected={onDropRejected}
                            maxFileSize={200 * 1024 * 1024}
                            showAlerts={false}
                            filesLimit={1}
                        />
                    </Grid>

                    {error &&
                    <FormHelperText error={true}>{error}</FormHelperText>}

                </Grid>
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
