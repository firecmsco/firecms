# File Upload


File Upload component is designed to easily handle the drag and drop of files as well as file selection through the dialog window. It supports features like file type restriction, maximum file size, custom titles, and descriptions.

## Usage

To use the `FileUpload`, import it from your components and pass the necessary props including `accept`, `onFilesAdded`, and optionally, `onFilesRejected`, `maxSize`, `disabled`, `maxFiles`, `title`, `uploadDescription`, `preventDropOnDocument`, and `size`.

## Basic File Upload

A simple file upload example with minimal configuration.

```tsx
import React from "react";
import { FileUpload } from "@firecms/ui";

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

```

## File Upload with Custom Types and Sizes

Demonstrating file upload with restrictions on file types and sizes, and custom messages.

```tsx
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
            size={"large"}
            accept={{ "image/*": ["png", "jpg"] }}
            onFilesAdded={onFilesAdded}
            onFilesRejected={onFilesRejected}
            maxSize={5000000} // 5MB
            title="Upload Image"
            uploadDescription="Only JPG and PNG files are accepted (Max size: 5MB)"
        />
    );
}

```

## Disabled File Upload

Illustrating how to disable the file upload functionality.

```tsx
import React from "react";
import { FileUpload } from "@firecms/ui";

export default function FileUploadDisabledDemo() {
    return (
        <FileUpload
            size={"large"}
            accept={{ "image/*": [] }}
            onFilesAdded={() => {}}
            title="Upload Disabled"
            uploadDescription="File uploading is disabled"
            disabled={true}
        />
    );
}

```

