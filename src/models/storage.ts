/**
 * @category Storage
 */
export interface UploadFileProps {
    file: File,
    fileName?: string,
    path?: string,
    metadata?: any,
}

/**
 * @category Storage
 */
export interface UploadFileResult {
    /**
     * Storage path including the file name where the file was uploaded.
     */
    path: string;
}

/**
 * @category Storage
 */
export interface StorageSource {
    /**
     * Upload a file, specifying a name and a path
     * @param file
     * @param fileName
     * @param path
     * @param metadata
     */
    uploadFile: ({
                     file,
                     fileName,
                     path,
                     metadata
                 }: UploadFileProps) => Promise<UploadFileResult>;

    /**
     * Convert a storage path into a download url
     * @param path
     */
    getDownloadURL: (path: string) => Promise<string>
}
