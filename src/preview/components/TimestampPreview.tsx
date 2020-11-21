import { PreviewComponentProps } from "../PreviewComponentProps";
import React from "react";
import { Typography } from "@material-ui/core";


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
