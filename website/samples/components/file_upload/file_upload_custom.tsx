import React from "react";
import { FileUpload } from "@firecms/ui";

export default function FileUploadCustomDemo() {
    const onFilesAdded = (files: File[]) => {
        console.log("Files added", files);
    };

    const onFilesRejected = (fileRejections) => {
        fileRejections.forEach(({ file, errors }) => {
            console.error(`File ${file.name} was rejected:`, errors);
        });
    };

    return (
        <FileUpload
            accept={{ "image/*": ["png", "jpg"] }}
            onFilesAdded={onFilesAdded}
            onFilesRejected={onFilesRejected}
            maxSize={5000000} // 5MB
            title="Upload Image"
            uploadDescription="Only JPG and PNG files are accepted (Max size: 5MB)"
        />
    );
}