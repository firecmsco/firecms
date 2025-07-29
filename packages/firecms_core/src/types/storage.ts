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
    path: string;
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if path is 'full/path/image.png', name is 'image.png'.
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
    getFile: (path: string, bucket?: string) => Promise<File | null>;

    /**
     * Delete a file.
     * @param path
     * @param bucket
     */
    deleteFile: (path: string, bucket?: string) => Promise<void>;

    /**
     * List the contents of a path.
     * @param path
     * @param options
     */
    list: (path: string, options?: {
        bucket?: string,
        maxResults?: number,
        pageToken?: string
    }) => Promise<StorageListResult>;

}

/**
 * Result returned by list().
 * @public
 */
export declare interface StorageListResult {
    /**
     * References to prefixes (sub-folders). You can call list() on them to
     * get its contents.
     *
     * Folders are implicit based on '/' in the object paths.
     * For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a')
     * will return '/a/b' as a prefix.
     */
    prefixes: StorageReference[];
    /**
     * Objects in this directory.
     * You can call getMetadata() and getDownloadUrl() on them.
     */
    items: StorageReference[];
    /**
     * If set, there might be more results for this list. Use this token to resume the list.
     */
    nextPageToken?: string;
}

/**
 * Represents a reference to a Google Cloud Storage object. Developers can
 * upload, download, and delete objects, as well as get/set object metadata.
 * @public
 */
export declare interface StorageReference {
    /**
     * Returns a gs:// URL for this object in the form
     *   `gs://<bucket>/<path>/<to>/<object>`
     * @returns The gs:// URL.
     */
    toString(): string;

    /**
     * A reference to the root of this object's bucket.
     */
    root: StorageReference;
    /**
     * The name of the bucket containing this reference's object.
     */
    bucket: string;
    /**
     * The full path of this object.
     */
    path: string;
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if path is 'full/path/image.png', name is 'image.png'.
     */
    name: string;

    /**
     * A reference pointing to the parent location of this reference, or null if
     * this reference is the root.
     */
    parent: StorageReference | null;
}
