import { PreviewComponentProps } from "../PreviewComponentProps";
import React from "react";
import { Typography } from "@material-ui/core";
import firebase from 'firebase/app';

export function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size,
                                     entitySchema
                                 }: PreviewComponentProps<firebase.firestore.Timestamp | Date>): React.ReactElement {


    return <Typography variant={"body2"}>
        {value.toLocaleString()}
    </Typography>;
}
