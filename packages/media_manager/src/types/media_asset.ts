/**
 * Represents a media asset stored in the media library.
 * This interface defines the metadata stored in the database for each file.
 */
export interface MediaAsset {
    /**
     * Unique identifier for the asset (document ID in the database)
     */
    id: string;

    /**
     * Original file name
     */
    fileName: string;

    /**
     * Path in storage where the file is located
     */
    storagePath: string;

    /**
     * Cached download URL for quick access
     */
    downloadURL?: string;

    /**
     * MIME type of the file (e.g., "image/jpeg", "application/pdf")
     */
    mimeType: string;

    /**
     * File size in bytes
     */
    size: number;

    /**
     * Dimensions for image/video files
     */
    dimensions?: {
        width: number;
        height: number;
    };

    /**
     * User-defined title for the asset
     */
    title?: string;

    /**
     * Alternative text for accessibility (SEO recommended)
     */
    altText?: string;

    /**
     * Optional caption/description
     */
    caption?: string;

    /**
     * User-defined tags for categorization
     */
    tags?: string[];

    /**
     * Timestamp when the asset was created
     */
    createdAt: Date;

    /**
     * Timestamp when the asset was last updated
     */
    updatedAt: Date;

    /**
     * Storage bucket name (for multi-bucket setups)
     */
    bucket?: string;

    /**
     * Thumbnail URLs keyed by size name (e.g., "small", "medium").
     * These are generated during upload based on thumbnailSizes config.
     */
    thumbnails?: Record<string, string>;
}
