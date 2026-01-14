import { DataSourceDelegate, StorageSource } from "@firecms/core";

/**
 * Configuration for a thumbnail size.
 * Thumbnails are generated client-side before upload.
 */
export interface ThumbnailSize {
    /**
     * Unique name for this size (e.g., "small", "medium", "large").
     * Used as a key in the thumbnails record.
     */
    name: string;

    /**
     * Maximum width in pixels.
     * The image will be scaled to fit within this width while maintaining aspect ratio.
     */
    width: number;

    /**
     * Maximum height in pixels.
     * The image will be scaled to fit within this height while maintaining aspect ratio.
     */
    height: number;

    /**
     * JPEG quality for the thumbnail (0-1).
     * @default 0.8
     */
    quality?: number;
}

/**
 * Configuration options for the Media Manager plugin.
 */
export interface MediaManagerConfig {
    /**
     * Storage source for file operations (upload, download, delete).
     * Typically useFirebaseStorageSource() or similar.
     */
    storageSource: StorageSource;

    /**
     * Data source delegate for metadata persistence.
     * Typically useFirestoreDelegate() or similar.
     */
    dataSourceDelegate: DataSourceDelegate;

    /**
     * Path in storage where media files will be uploaded.
     * @default "media"
     */
    storagePath?: string;

    /**
     * Collection path in the database for storing asset metadata.
     * @default "media_assets"
     */
    collectionPath?: string;

    /**
     * Optional bucket name for storage operations.
     * If not specified, uses the default bucket.
     */
    bucket?: string;

    /**
     * Maximum file size allowed for uploads (in bytes).
     * @default 52428800 (50MB)
     */
    maxFileSize?: number;

    /**
     * Allowed MIME types for uploads.
     * If not specified, all file types are allowed.
     */
    acceptedMimeTypes?: string[];

    /**
     * Thumbnail sizes to generate on upload.
     * Thumbnails are generated client-side using canvas before upload.
     * If not specified, no thumbnails are generated.
     * 
     * @example
     * ```typescript
     * thumbnailSizes: [
     *     { name: "small", width: 150, height: 150 },
     *     { name: "medium", width: 400, height: 400 }
     * ]
     * ```
     */
    thumbnailSizes?: ThumbnailSize[];

    /**
     * Subfolder path for storing thumbnails.
     * Thumbnails are stored under `{storagePath}/{thumbnailPath}/{sizeName}/`.
     * @default "thumbs"
     */
    thumbnailPath?: string;
}
