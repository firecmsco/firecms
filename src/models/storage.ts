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
    path: string;
}

/**
 * @category Storage
 */
export interface StorageSource {
    uploadFile: ({
                     file,
                     fileName,
                     path,
                     metadata
                 }: UploadFileProps) => Promise<UploadFileResult>;

    getDownloadURL: (path: string) => Promise<string>
}
