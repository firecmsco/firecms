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
export interface DownloadConfig {
    /**
     * Temporal url that can be used to download the file
     */
    url: string;

    metadata?: DownloadMetadata;
}

/**
 * The full set of object metadata, including read-only properties.
 * @public
 */
export declare interface DownloadMetadata {
    /**
     * The bucket this object is contained in.
     */
    bucket: string;
    /**
     * The full path of this object.
     */
    fullPath: string;
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
     */
    name: string;
    /**
     * The size of this object, in bytes.
     */
    size: number;
    /**
     * Type of the uploaded file
     * e.g. "image/jpeg"
     */
    contentType: string;

    customMetadata: Record<string, unknown>;
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
     * Convert a storage path or URL into a download configuration
     * @param path
     */
    getDownloadURL: (pathOrUrl: string) => Promise<DownloadConfig>;

    /**
     * Get a file from a storage path.
     * It returns null if the file does not exist.
     * @param props
     */
    getFile: (path:string) => Promise<File | null>;
}
