import React, { useCallback, useState } from "react";
import {
    Button,
    Typography,
    cls,
    Dialog,
    DialogActions,
    DialogContent,
    CloudUploadIcon,
    CircularProgress
} from "@firecms/ui";

export interface MediaUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onUpload: (files: File[]) => Promise<void>;
    maxFileSize?: number;
    acceptedMimeTypes?: string[];
}

/**
 * Dialog component for uploading files to the media library.
 * Supports drag-and-drop and file browser selection.
 */
export function MediaUploadDialog({
    open,
    onClose,
    onUpload,
    maxFileSize = 52428800, // 50MB default
    acceptedMimeTypes
}: MediaUploadDialogProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
        const valid: File[] = [];
        const errors: string[] = [];

        for (const file of files) {
            if (maxFileSize && file.size > maxFileSize) {
                errors.push(`${file.name}: File too large (max ${formatSize(maxFileSize)})`);
                continue;
            }
            if (acceptedMimeTypes && !acceptedMimeTypes.some(type => {
                if (type.endsWith("/*")) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type;
            })) {
                errors.push(`${file.name}: File type not allowed`);
                continue;
            }
            valid.push(file);
        }

        return { valid, errors };
    }, [maxFileSize, acceptedMimeTypes]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const { valid, errors } = validateFiles(files);

        if (errors.length > 0) {
            setError(errors.join("\n"));
        } else {
            setError(null);
        }

        setSelectedFiles(prev => [...prev, ...valid]);
    }, [validateFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const { valid, errors } = validateFiles(files);

        if (errors.length > 0) {
            setError(errors.join("\n"));
        } else {
            setError(null);
        }

        setSelectedFiles(prev => [...prev, ...valid]);
    }, [validateFiles]);

    const handleRemoveFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            await onUpload(selectedFiles);
            setSelectedFiles([]);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }, [selectedFiles, onUpload, onClose]);

    const handleClose = useCallback(() => {
        if (!uploading) {
            setSelectedFiles([]);
            setError(null);
            onClose();
        }
    }, [uploading, onClose]);

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open && handleClose()}
            maxWidth="md"
        >
            <DialogContent className="p-0">
                <div className="p-4 border-b border-surface-accent-200 dark:border-surface-accent-700">
                    <Typography variant="h6">
                        Upload Files
                    </Typography>
                </div>

                <div className="p-4">
                    {/* Drop Zone */}
                    <div
                        className={cls(
                            "border-2 border-dashed rounded-lg p-8",
                            "flex flex-col items-center justify-center gap-4",
                            "transition-colors duration-150",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-surface-accent-300 dark:border-surface-accent-600",
                            "hover:border-primary hover:bg-primary/5",
                            "cursor-pointer"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-upload-input")?.click()}
                    >
                        <CloudUploadIcon
                            size="large"
                            className={cls(
                                isDragging ? "text-primary" : "text-surface-accent-400"
                            )}
                        />
                        <div className="text-center">
                            <Typography variant="body1" className="font-medium">
                                Drop files here or click to browse
                            </Typography>
                            <Typography variant="caption" className="text-surface-accent-500">
                                Maximum file size: {formatSize(maxFileSize)}
                            </Typography>
                        </div>
                        <input
                            id="file-upload-input"
                            type="file"
                            multiple
                            accept={acceptedMimeTypes?.join(",")}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Typography variant="caption" className="text-red-500 mt-2 block whitespace-pre-line">
                            {error}
                        </Typography>
                    )}

                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <Typography variant="caption" className="text-surface-accent-500">
                                Selected files ({selectedFiles.length})
                            </Typography>
                            <div className="max-h-40 overflow-auto space-y-1">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className={cls(
                                            "flex items-center justify-between p-2 rounded",
                                            "bg-surface-accent-50 dark:bg-surface-accent-800"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <Typography variant="body2" className="truncate">
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" className="text-surface-accent-500">
                                                {formatSize(file.size)}
                                            </Typography>
                                        </div>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(index);
                                            }}
                                            disabled={uploading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="text"
                    onClick={handleClose}
                    disabled={uploading}
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                >
                    {uploading ? (
                        <>
                            <CircularProgress size="smallest" />
                            Uploading...
                        </>
                    ) : (
                        `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
