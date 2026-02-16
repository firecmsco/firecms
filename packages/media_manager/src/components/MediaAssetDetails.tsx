import React, { useCallback, useState } from "react";
import { useCreateFormex } from "@firecms/formex";
import {
    Button,
    Typography,
    cls,
    CloseIcon,
    DeleteIcon,
    DownloadIcon,
    IconButton,
    TextField,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent
} from "@firecms/ui";
import { useSnackbarController, useStorageSource } from "@firecms/core";
import { MediaAsset } from "../types";

export interface MediaAssetDetailsProps {
    asset: MediaAsset;
    onClose: () => void;
    onUpdate: (assetId: string, data: Partial<MediaAsset>) => Promise<void>;
    onDelete: (assetId: string) => Promise<void>;
}

/**
 * Side panel component for viewing and editing media asset details.
 */
export function MediaAssetDetails({
    asset,
    onClose,
    onUpdate,
    onDelete
}: MediaAssetDetailsProps) {
    const snackbarController = useSnackbarController();
    const storageSource = useStorageSource();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const { values, setFieldValue, dirty } = useCreateFormex<Partial<MediaAsset>>({
        initialValues: {
            title: asset.title ?? "",
            altText: asset.altText ?? "",
            caption: asset.caption ?? "",
            tags: asset.tags ?? []
        }
    });

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await onUpdate(asset.id, values);
            snackbarController.open({
                type: "success",
                message: "Asset updated successfully"
            });
        } catch (error) {
            snackbarController.open({
                type: "error",
                message: `Error updating asset: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            setSaving(false);
        }
    }, [asset.id, values, onUpdate, snackbarController]);

    const handleDelete = useCallback(async () => {
        setDeleting(true);
        try {
            await onDelete(asset.id);
            snackbarController.open({
                type: "success",
                message: "Asset deleted successfully"
            });
            onClose();
        } catch (error) {
            snackbarController.open({
                type: "error",
                message: `Error deleting asset: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    }, [asset.id, onDelete, snackbarController, onClose]);

    const handleDownload = useCallback(async () => {
        try {
            const downloadConfig = await storageSource.getDownloadURL(asset.storagePath, asset.bucket);
            if (downloadConfig.url) {
                window.open(downloadConfig.url, "_blank");
            }
        } catch (error) {
            snackbarController.open({
                type: "error",
                message: "Error getting download URL"
            });
        }
    }, [asset, storageSource, snackbarController]);

    const handleAddTag = useCallback(() => {
        const tag = tagInput.trim();
        if (tag && !values.tags?.includes(tag)) {
            setFieldValue("tags", [...(values.tags ?? []), tag]);
            setTagInput("");
        }
    }, [tagInput, values.tags, setFieldValue]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setFieldValue("tags", values.tags?.filter((t: string) => t !== tagToRemove) ?? []);
    }, [values.tags, setFieldValue]);

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    };

    const isImage = asset.mimeType.startsWith("image/");
    const isVideo = asset.mimeType.startsWith("video/");

    return (
        <>
            <div className={cls(
                "fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[480px]",
                "bg-surface-50 dark:bg-surface-900",
                "border-l border-surface-accent-200 dark:border-surface-accent-700",
                "shadow-xl z-50",
                "flex flex-col",
                "animate-slide-in-right"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-accent-200 dark:border-surface-accent-700">
                    <Typography variant="subtitle1" className="font-medium truncate flex-1 mr-2">
                        {asset.title || asset.fileName}
                    </Typography>
                    <div className="flex items-center gap-1">
                        <IconButton onClick={handleDownload}>
                            <DownloadIcon size="small" />
                        </IconButton>
                        <IconButton
                            onClick={() => setDeleteDialogOpen(true)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <DeleteIcon size="small" />
                        </IconButton>
                        <IconButton onClick={onClose}>
                            <CloseIcon size="small" />
                        </IconButton>
                    </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-surface-accent-100 dark:bg-surface-accent-800 flex items-center justify-center min-h-48 max-h-64">
                    {isImage && asset.downloadURL ? (
                        <img
                            src={asset.downloadURL}
                            alt={asset.altText || asset.fileName}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isVideo && asset.downloadURL ? (
                        <video
                            src={asset.downloadURL}
                            className="max-w-full max-h-full"
                            controls
                        />
                    ) : (
                        <div className="text-surface-accent-400">
                            Preview not available
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3">
                        {asset.dimensions && (
                            <div>
                                <Typography variant="caption" className="text-surface-accent-500">
                                    Dimensions
                                </Typography>
                                <Typography variant="body2">
                                    {asset.dimensions.width} × {asset.dimensions.height} px
                                </Typography>
                            </div>
                        )}
                        <div>
                            <Typography variant="caption" className="text-surface-accent-500">
                                Size
                            </Typography>
                            <Typography variant="body2">
                                {formatSize(asset.size)}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="caption" className="text-surface-accent-500">
                                Type
                            </Typography>
                            <Typography variant="body2">
                                {asset.mimeType}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="caption" className="text-surface-accent-500">
                                Created
                            </Typography>
                            <Typography variant="body2">
                                {formatDate(asset.createdAt)}
                            </Typography>
                        </div>
                    </div>

                    <hr className="border-surface-accent-200 dark:border-surface-accent-700" />

                    {/* Editable Fields */}
                    <TextField
                        label="File Name"
                        value={asset.fileName}
                        disabled
                        size="small"
                    />

                    <TextField
                        label="Title"
                        value={values.title ?? ""}
                        onChange={(e) => setFieldValue("title", e.target.value)}
                        size="small"
                    />

                    <div>
                        <TextField
                            label="Alt Text"
                            value={values.altText ?? ""}
                            onChange={(e) => setFieldValue("altText", e.target.value)}
                            size="small"
                        />
                        <Typography variant="caption" className="text-surface-accent-500 mt-1">
                            Recommended for SEO
                        </Typography>
                    </div>

                    <TextField
                        label="Caption"
                        value={values.caption ?? ""}
                        onChange={(e) => setFieldValue("caption", e.target.value)}
                        size="small"
                        multiline
                    />

                    {/* Tags */}
                    <div>
                        <Typography variant="caption" className="text-surface-accent-500 mb-1 block">
                            Tags
                        </Typography>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {values.tags?.map((tag: string) => (
                                <Chip
                                    key={tag}
                                    size="small"
                                    colorScheme="blueLighter"
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    {tag} ×
                                </Chip>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <TextField
                                placeholder="Add a tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                size="small"
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-surface-accent-200 dark:border-surface-accent-700">
                    <Button
                        variant="filled"
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        className="w-full"
                    >
                        {saving ? <CircularProgress size="small" /> : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent>
                    <Typography variant="subtitle1" className="font-medium mb-2">
                        Delete Asset?
                    </Typography>
                    <Typography className="text-surface-accent-600 dark:text-surface-accent-400">
                        Are you sure you want to delete "{asset.title || asset.fileName}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size="small" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
