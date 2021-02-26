import { PreviewComponentProps } from "../../preview";
import React from "react";
import firebase from "firebase/app";

export function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size,
                                 }: PreviewComponentProps<firebase.firestore.Timestamp | Date>): React.ReactElement {

    return (
        <>
            {value.toLocaleString()}
        </>
    );
}
