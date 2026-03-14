import React from "react";
import { FileUpload } from "@rebasepro/ui";

export default function FileUploadBasicDemo() {
    const onFilesAdded = (files: File[]) => {
        console.log(files);
    };

    return (
        <FileUpload
            size={"large"}
            accept={{ "image/*": [] }}
            onFilesAdded={onFilesAdded}
            title="Upload your file"
            uploadDescription="Drag and drop a file here or click"
        />
    );
}
