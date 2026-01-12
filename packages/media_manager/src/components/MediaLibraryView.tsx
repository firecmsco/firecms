import React, { useCallback, useRef, useState } from "react";
import {
    Button,
    Container,
    SearchBar,
    Typography,
    cls,
    AddIcon,
    CircularProgress,
    RefreshIcon,
    IconButton,
    Tooltip,
    AppsIcon,
    Icon
} from "@firecms/ui";
import { useMediaManager } from "../MediaManagerProvider";
import { MediaAssetCard } from "./MediaAssetCard";
import { MediaAssetDetails } from "./MediaAssetDetails";
import { MediaUploadDialog } from "./MediaUploadDialog";

export interface MediaLibraryViewProps {
    maxFileSize?: number;
    acceptedMimeTypes?: string[];
}

/**
 * Main view component for the Media Library.
 * Displays a grid of assets with search, upload, and management capabilities.
 */
export function MediaLibraryView({
    maxFileSize,
    acceptedMimeTypes
}: MediaLibraryViewProps) {
    const controller = useMediaManager();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback((query?: string) => {
        controller.searchAssets(query ?? "");
    }, [controller]);

    const handleUploadClick = useCallback(() => {
        setUploadDialogOpen(true);
    }, []);

    const handleFileSelect = useCallback(async (files: File[]) => {
        for (const file of files) {
            await controller.uploadFile(file);
        }
        setUploadDialogOpen(false);
    }, [controller]);

    const handleRefresh = useCallback(() => {
        controller.refreshAssets();
    }, [controller]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-surface-accent-200 dark:border-surface-accent-700 bg-surface-50 dark:bg-surface-900">
                <Container maxWidth="6xl" className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Typography variant="h5" className="font-semibold">
                                Media Library
                            </Typography>
                            {controller.totalCount !== undefined && (
                                <Typography
                                    variant="caption"
                                    className="bg-surface-accent-100 dark:bg-surface-accent-800 px-2 py-0.5 rounded-full"
                                >
                                    {controller.totalCount} assets
                                </Typography>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <SearchBar
                                onTextSearch={handleSearch}
                                placeholder="Search assets..."
                                className="flex-1 sm:w-64"
                            />

                            <div className="flex items-center gap-1 border-l border-surface-accent-200 dark:border-surface-accent-700 pl-2 ml-2">
                                <Tooltip title="Grid view">
                                    <IconButton
                                        onClick={() => setViewMode("grid")}
                                        className={cls(
                                            viewMode === "grid" && "bg-surface-accent-100 dark:bg-surface-accent-800"
                                        )}
                                    >
                                        <AppsIcon size="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="List view">
                                    <IconButton
                                        onClick={() => setViewMode("list")}
                                        className={cls(
                                            viewMode === "list" && "bg-surface-accent-100 dark:bg-surface-accent-800"
                                        )}
                                    >
                                        <Icon iconKey="list" size="small" />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} disabled={controller.loading}>
                                    <RefreshIcon size="small" />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="filled"
                                onClick={handleUploadClick}
                            >
                                <AddIcon size="small" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <Container maxWidth="6xl" className="py-6">
                    {controller.loading && controller.assets.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <CircularProgress />
                        </div>
                    ) : controller.error ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Typography className="text-red-500">
                                Error loading assets: {controller.error.message}
                            </Typography>
                            <Button variant="outlined" onClick={handleRefresh}>
                                Try Again
                            </Button>
                        </div>
                    ) : controller.assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Typography className="text-surface-accent-500">
                                No media assets yet
                            </Typography>
                            <Button variant="outlined" onClick={handleUploadClick}>
                                <AddIcon size="small" />
                                Upload your first file
                            </Button>
                        </div>
                    ) : (
                        <div className={cls(
                            viewMode === "grid"
                                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                : "flex flex-col gap-2"
                        )}>
                            {controller.assets.map(asset => (
                                <MediaAssetCard
                                    key={asset.id}
                                    asset={asset}
                                    viewMode={viewMode}
                                    onClick={() => controller.selectAsset(asset)}
                                    selected={controller.selectedAsset?.id === asset.id}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </div>

            {/* Details Panel */}
            {controller.selectedAsset && (
                <MediaAssetDetails
                    asset={controller.selectedAsset}
                    onClose={() => controller.selectAsset(undefined)}
                    onUpdate={controller.updateAsset}
                    onDelete={controller.deleteAsset}
                />
            )}

            {/* Upload Dialog */}
            <MediaUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onUpload={handleFileSelect}
                maxFileSize={maxFileSize}
                acceptedMimeTypes={acceptedMimeTypes}
            />
        </div>
    );
}
