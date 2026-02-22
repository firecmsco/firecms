import { MediaAsset } from "./media_asset";

/**
 * Controller interface for managing media assets.
 * Provides methods for CRUD operations and state management.
 */
export interface MediaManagerController {
    /**
     * Whether the controller is currently loading data
     */
    loading: boolean;

    /**
     * Error if any operation failed
     */
    error?: Error;

    /**
     * List of loaded media assets
     */
    assets: MediaAsset[];

    /**
     * Total count of assets (may differ from assets.length during pagination)
     */
    totalCount?: number;

    /**
     * Currently selected asset (for details view)
     */
    selectedAsset?: MediaAsset;

    /**
     * Select an asset for viewing/editing
     */
    selectAsset: (asset: MediaAsset | undefined) => void;

    /**
     * Upload a new file to the media library
     * @param file The file to upload
     * @param metadata Optional metadata to attach
     * @returns The created MediaAsset
     */
    uploadFile: (file: File, metadata?: Partial<Pick<MediaAsset, "title" | "altText" | "caption" | "tags">>) => Promise<MediaAsset>;

    /**
     * Delete an asset from storage and database
     * @param assetId The ID of the asset to delete
     */
    deleteAsset: (assetId: string | number) => Promise<void>;

    /**
     * Update asset metadata
     * @param assetId The ID of the asset to update
     * @param data The fields to update
     */
    updateAsset: (assetId: string | number, data: Partial<MediaAsset>) => Promise<void>;

    /**
     * Refresh the assets list from the database
     */
    refreshAssets: () => Promise<void>;

    /**
     * Search assets by text
     * @param query Search query string
     */
    searchAssets: (query: string) => void;

    /**
     * Storage path configuration
     */
    storagePath: string;

    /**
     * Collection path configuration
     */
    collectionPath: string;
}
