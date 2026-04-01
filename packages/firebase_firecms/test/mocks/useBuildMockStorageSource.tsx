import { DownloadConfig, StorageSource, UploadFileProps, UploadFileResult } from "@firecms/core";

export function useBuildMockStorageSource(): StorageSource {

    return {
        getDownloadURL(pathOrUrl: string): Promise<DownloadConfig> {
            throw new Error("Function not implemented.");
        }, getFile(path: string): Promise<File | null> {
            throw new Error("Function not implemented.");
        }, uploadFile({ file, fileName, path, metadata, onProgress }: UploadFileProps): Promise<UploadFileResult> {
            throw new Error("Function not implemented.");
        }
    };

}
