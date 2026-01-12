import { useCallback, useEffect, useState } from "react";
import { DataSourceDelegate, StorageSource } from "@firecms/core";
import { MediaAsset, MediaManagerController, ThumbnailSize } from "./types";

export interface UseMediaManagerControllerProps {
    storageSource: StorageSource;
    dataSourceDelegate: DataSourceDelegate;
    storagePath: string;
    collectionPath: string;
    bucket?: string;
    /** Thumbnail sizes to generate on upload */
    thumbnailSizes?: ThumbnailSize[];
    /** Path prefix for thumbnails. Default: "thumbs" */
    thumbnailPath?: string;
}

const DEFAULT_THUMBNAIL_PATH = "thumbs";

/**
 * Hook that creates a MediaManagerController for managing media assets.
 * Handles all CRUD operations for files and their metadata.
 */
export function useMediaManagerController({
    storageSource,
    dataSourceDelegate,
    storagePath,
    collectionPath,
    bucket,
    thumbnailSizes,
    thumbnailPath = DEFAULT_THUMBNAIL_PATH
}: UseMediaManagerControllerProps): MediaManagerController {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | undefined>();
    const [searchQuery, setSearchQuery] = useState("");

    // Helper to fetch download URL for an asset
    const fetchDownloadURL = useCallback(async (asset: Omit<MediaAsset, "downloadURL">): Promise<MediaAsset> => {
        try {
            const downloadConfig = await storageSource.getDownloadURL(asset.storagePath, asset.bucket);
            return {
                ...asset,
                downloadURL: downloadConfig.url ?? undefined
            };
        } catch (err) {
            console.warn(`Failed to get download URL for ${asset.storagePath}:`, err);
            return { ...asset, downloadURL: undefined };
        }
    }, [storageSource]);

    // Fetch assets from the database
    const refreshAssets = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            console.log("Fetching media assets from:", collectionPath);
            const entities = await dataSourceDelegate.fetchCollection<Record<string, any>>({
                path: collectionPath,
                orderBy: "createdAt",
                order: "desc"
            });

            console.log("Fetched entities:", entities.length);

            if (entities.length === 0) {
                setAssets([]);
                return;
            }

            // Convert entities to assets and fetch download URLs
            const loadedAssets: MediaAsset[] = await Promise.all(
                entities.map(async (entity) => {
                    const values = entity.values;
                    const baseAsset: Omit<MediaAsset, "downloadURL"> = {
                        id: entity.id,
                        fileName: values.fileName,
                        storagePath: values.storagePath,
                        mimeType: values.mimeType,
                        size: values.size,
                        dimensions: values.dimensions,
                        title: values.title,
                        altText: values.altText,
                        caption: values.caption,
                        tags: values.tags,
                        bucket: values.bucket,
                        createdAt: values.createdAt instanceof Date
                            ? values.createdAt
                            : (values.createdAt?.toDate ? values.createdAt.toDate() : new Date(values.createdAt)),
                        updatedAt: values.updatedAt instanceof Date
                            ? values.updatedAt
                            : (values.updatedAt?.toDate ? values.updatedAt.toDate() : new Date(values.updatedAt))
                    };

                    // Fetch download URL for images
                    if (baseAsset.mimeType?.startsWith("image/") || baseAsset.mimeType?.startsWith("video/")) {
                        return await fetchDownloadURL(baseAsset);
                    }
                    return { ...baseAsset, downloadURL: undefined };
                })
            );

            console.log("Loaded assets with URLs:", loadedAssets.length);
            setAssets(loadedAssets);
        } catch (err) {
            console.error("Error fetching media assets:", err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [dataSourceDelegate, collectionPath, fetchDownloadURL]);

    // Initial load
    useEffect(() => {
        refreshAssets();
    }, [refreshAssets]);

    // Upload a new file
    const uploadFile = useCallback(async (
        file: File,
        metadata?: Partial<Pick<MediaAsset, "title" | "altText" | "caption" | "tags">>
    ): Promise<MediaAsset> => {
        console.log("Uploading file:", file.name, "to path:", storagePath);

        // Upload to storage
        const uploadResult = await storageSource.uploadFile({
            file,
            fileName: file.name,
            path: storagePath,
            bucket
        });

        console.log("Upload result:", uploadResult);

        // Get download URL immediately after upload
        let downloadURL: string | undefined;
        try {
            const downloadConfig = await storageSource.getDownloadURL(uploadResult.path, uploadResult.bucket);
            downloadURL = downloadConfig.url ?? undefined;
            console.log("Got download URL:", downloadURL);
        } catch (err) {
            console.warn("Failed to get download URL after upload:", err);
        }

        // Get dimensions for images
        let dimensions: { width: number; height: number } | undefined;
        if (file.type.startsWith("image/")) {
            try {
                dimensions = await getImageDimensions(file);
            } catch (err) {
                console.warn("Failed to get image dimensions:", err);
            }
        }

        // Generate thumbnails if configured and file is a raster image (skip SVGs)
        const thumbnails: Record<string, string> = {};
        const isRasterImage = file.type.startsWith("image/") && file.type !== "image/svg+xml";
        if (thumbnailSizes && thumbnailSizes.length > 0 && isRasterImage) {
            console.log("Generating thumbnails for sizes:", thumbnailSizes.map(s => s.name));

            for (const size of thumbnailSizes) {
                try {
                    const thumbnailBlob = await generateThumbnail(file, size.width, size.height, size.quality ?? 0.8);
                    const thumbFileName = `${Date.now()}_${size.name}_${file.name}`;
                    const thumbPath = `${storagePath}/${thumbnailPath}/${size.name}`;

                    // Upload thumbnail
                    const thumbUploadResult = await storageSource.uploadFile({
                        file: new File([thumbnailBlob], thumbFileName, { type: "image/jpeg" }),
                        fileName: thumbFileName,
                        path: thumbPath,
                        bucket
                    });

                    // Get download URL for thumbnail
                    const thumbDownloadConfig = await storageSource.getDownloadURL(thumbUploadResult.path, thumbUploadResult.bucket);
                    if (thumbDownloadConfig.url) {
                        thumbnails[size.name] = thumbDownloadConfig.url;
                        console.log(`Generated ${size.name} thumbnail:`, thumbDownloadConfig.url);
                    }
                } catch (err) {
                    console.warn(`Failed to generate ${size.name} thumbnail:`, err);
                }
            }
        }

        const now = new Date();

        // Build asset data, only including defined values (Firestore doesn't allow undefined)
        const assetData: Record<string, any> = {
            fileName: file.name,
            storagePath: uploadResult.path,
            mimeType: file.type,
            size: file.size,
            createdAt: now,
            updatedAt: now
        };

        // Only add optional fields if they are defined
        if (dimensions) assetData.dimensions = dimensions;
        if (metadata?.title) assetData.title = metadata.title;
        if (metadata?.altText) assetData.altText = metadata.altText;
        if (metadata?.caption) assetData.caption = metadata.caption;
        if (metadata?.tags && metadata.tags.length > 0) assetData.tags = metadata.tags;
        if (uploadResult.bucket) assetData.bucket = uploadResult.bucket;
        // Store downloadURL in database for quick access later
        if (downloadURL) assetData.downloadURL = downloadURL;
        // Store thumbnails if any were generated
        if (Object.keys(thumbnails).length > 0) assetData.thumbnails = thumbnails;

        console.log("Saving asset data to database:", assetData);

        // Save metadata to database
        const entity = await dataSourceDelegate.saveEntity<Record<string, any>>({
            path: collectionPath,
            values: assetData,
            status: "new"
        });

        console.log("Saved entity:", entity.id);

        const newAsset: MediaAsset = {
            id: entity.id,
            fileName: file.name,
            storagePath: uploadResult.path,
            downloadURL,
            mimeType: file.type,
            size: file.size,
            createdAt: now,
            updatedAt: now,
            dimensions,
            title: metadata?.title,
            altText: metadata?.altText,
            caption: metadata?.caption,
            tags: metadata?.tags,
            bucket: uploadResult.bucket,
            thumbnails: Object.keys(thumbnails).length > 0 ? thumbnails : undefined
        };

        setAssets(prev => [newAsset, ...prev]);
        return newAsset;
    }, [storageSource, dataSourceDelegate, storagePath, collectionPath, bucket, thumbnailSizes, thumbnailPath]);

    // Delete an asset
    const deleteAsset = useCallback(async (assetId: string): Promise<void> => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) {
            throw new Error(`Asset with id ${assetId} not found`);
        }

        console.log("Deleting asset:", assetId, asset.storagePath);

        // Delete from storage
        try {
            await storageSource.deleteFile(asset.storagePath, asset.bucket);
        } catch (err) {
            console.warn("Failed to delete from storage (may not exist):", err);
        }

        // Delete from database
        await dataSourceDelegate.deleteEntity({
            entity: {
                id: assetId,
                path: collectionPath,
                values: asset
            }
        });

        setAssets(prev => prev.filter(a => a.id !== assetId));
        if (selectedAsset?.id === assetId) {
            setSelectedAsset(undefined);
        }
    }, [assets, storageSource, dataSourceDelegate, collectionPath, selectedAsset]);

    // Update asset metadata
    const updateAsset = useCallback(async (
        assetId: string,
        data: Partial<MediaAsset>
    ): Promise<void> => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) {
            throw new Error(`Asset with id ${assetId} not found`);
        }

        // Filter out undefined values
        const cleanData: Record<string, any> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                cleanData[key] = value;
            }
        });
        cleanData.updatedAt = new Date();

        console.log("Updating asset:", assetId, cleanData);

        await dataSourceDelegate.saveEntity({
            path: collectionPath,
            entityId: assetId,
            values: cleanData,
            previousValues: asset,
            status: "existing"
        });

        setAssets(prev => prev.map(a =>
            a.id === assetId ? { ...a, ...cleanData } : a
        ));

        if (selectedAsset?.id === assetId) {
            setSelectedAsset(prev => prev ? { ...prev, ...cleanData } : prev);
        }
    }, [assets, dataSourceDelegate, collectionPath, selectedAsset]);

    // Search assets (client-side filtering for now)
    const searchAssets = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const selectAsset = useCallback((asset: MediaAsset | undefined) => {
        setSelectedAsset(asset);
    }, []);

    // Filter assets based on search query
    const filteredAssets = searchQuery
        ? assets.filter(asset =>
            asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : assets;

    return {
        loading,
        error,
        assets: filteredAssets,
        totalCount: assets.length,
        selectedAsset,
        selectAsset,
        uploadFile,
        deleteAsset,
        updateAsset,
        refreshAssets,
        searchAssets,
        storagePath,
        collectionPath
    };
}

/**
 * Helper to get image dimensions from a File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generate a thumbnail from an image file using compressorjs.
 * Uses the same library as the core FireCMS image resize implementation.
 * Maintains aspect ratio while fitting within maxWidth x maxHeight.
 */
async function generateThumbnail(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
): Promise<Blob> {
    // Dynamic import to avoid bundling issues
    const Compressor = (await import("compressorjs")).default;

    return new Promise<Blob>((resolve, reject) => {
        new Compressor(file, {
            quality,
            maxWidth,
            maxHeight,
            mimeType: "image/jpeg",
            success: (result) => {
                resolve(result);
            },
            error: reject,
        });
    });
}
