import { PreviewComponentProps } from "../../models/preview_component_props";
import React from "react";
import firebase from "firebase/app";

export function TimestampPreview({
                                     name,
                                     value,
                                     property,
                                     size,
                                     entitySchema
                                 }: PreviewComponentProps<firebase.firestore.Timestamp | Date>): React.ReactElement {

    return (
        <>
            {value.toLocaleString()}
        </>
    );
}
