
export interface UploadFileResult {
    path: string;
}
/**
 * @category Storage
 */
export interface StorageSource {
    uploadFile: (file: File,
                 fileName?: string,
                 path?: string,
                 metadata?: any) => Promise<UploadFileResult>;

    getDownloadURL: (storagePath: string) => Promise<string>
}
