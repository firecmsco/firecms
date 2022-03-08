import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";

const fileTypes = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio files",
    "application/*": "Files (pdf, zip, csv, excel...)",
    "text/*": "Text files"
}

export function FieldUploadPropertyFieldAdvanced({
                                                     multiple
                                                 }: {
    multiple: boolean
}) {

    return (
        <>

            <Grid item>
                <Typography variant={"subtitle2"}>
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    <GeneralPropertyValidation/>
                </Paper>

            </Grid>

        </>
    );
}

