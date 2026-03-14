import React from "react";
import { FileUpload } from "@rebasepro/ui";

export default function FileUploadDisabledDemo() {
    return (
        <FileUpload
            size={"large"}
            accept={{ "image/*": [] }}
            onFilesAdded={() => { }}
            title="Upload Disabled"
            uploadDescription="File uploading is disabled"
            disabled={true}
        />
    );
}
