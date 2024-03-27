/**
 * @group Models
 */
export interface UploadFileProps {
    file: File,
    fileName?: string,
    path?: string,
    metadata?: any,
    bucket?: string
}

/**
 * @group Models
 */
export interface UploadFileResult {
    /**
     * Storage path including the file name where the file was uploaded.
     */
    path: string;
    /**
     * Bucket where the file was uploaded
     */
    bucket: string;
}

/**
 * @group Models
 */
export interface DownloadConfig {
    /**
     * Temporal url that can be used to download the file
     */
    url: string | null;

    metadata?: DownloadMetadata;

    fileNotFound?: boolean;
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
 * @group Models
 */
export interface StorageSource {
    /**
     * Upload a file, specifying a name and a path
     * @param file
     * @param fileName
     * @param path
     * @param metadata
     * @param bucket
     */
    uploadFile: ({
                     file,
                     fileName,
                     path,
                     metadata,
                     bucket
                 }: UploadFileProps) => Promise<UploadFileResult>;

    /**
     * Convert a storage path or URL into a download configuration
     * @param path
     * @param bucket
     */
    getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;

    /**
     * Get a file from a storage path.
     * It returns null if the file does not exist.
     * @param props
     * @param bucket
     */
    getFile: (path:string, bucket?: string) => Promise<File | null>;
}
