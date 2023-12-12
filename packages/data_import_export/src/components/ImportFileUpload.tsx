import { FileUpload, UploadIcon } from "@firecms/core";
import { convertFileToJson } from "../utils/file_to_json";

export function ImportFileUpload({ onDataAdded }: { onDataAdded: (data: object[]) => void }) {
    return <FileUpload
        accept={{
            "text/*": [".csv", ".xls", ".xlsx"],
            "application/vnd.ms-excel": [".xls", ".xlsx"],
            "application/msexcel": [".xls", ".xlsx"],
            "application/vnd.ms-office": [".xls", ".xlsx"],
            "application/xls": [".xls", ".xlsx"],
            "application/x-xls": [".xls", ".xlsx"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xls", ".xlsx"],
            "application/json": [".json"],
        }}
        preventDropOnDocument={true}
        size={"small"}
        maxFiles={1}
        uploadDescription={<><UploadIcon/>Drag and drop a file here or click to upload</>}
        onFilesAdded={(files: File[]) => {
            if (files.length > 0) {
                convertFileToJson(files[0])
                    .then((jsonData) => {
                        onDataAdded(jsonData);
                    });
            }
        }}/>
}
