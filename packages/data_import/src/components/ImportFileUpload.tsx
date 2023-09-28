import { FileUpload, UploadIcon } from "firecms";
import { convertFileToJson } from "../utils/file_to_json";

export function ImportFileUpload({ onDataAdded }: { onDataAdded: (data: object[]) => void }) {
    return <FileUpload
        accept={{
            "text/*": [".csv", ".json", ".xls", ".xlsx"],
            "application/*": [".xls", ".xlsx"],
            "*/*": [".xls", ".xlsx"]
        }}
        preventDropOnDocument={false}
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
