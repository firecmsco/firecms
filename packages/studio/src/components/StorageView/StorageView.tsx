import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Typography,
    cls,
    defaultBorderMixin,
    Button,
    IconButton,
    Tooltip,
    CircularProgress,
    ResizablePanels,
    Chip,
    Dialog,
    DialogContent,
    DialogActions,
    RefreshIcon,
    DeleteIcon,
    CloseIcon,
    AddIcon,
    DownloadIcon,
    CloudUploadIcon,
    FolderIcon,
    DescriptionIcon,
    ImageIcon,
    VideoLibraryIcon,
    AudiotrackIcon,
    ArrowBackIcon,
    Icon,
    FileUpload
} from "@rebasepro/ui";
import { useStorageSource, useSnackbarController, ErrorView } from "@rebasepro/core";
import type { StorageListResult } from "@rebasepro/types";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface StorageFile {
    name: string;
    fullPath: string;
    isFolder: boolean;
    /** Only populated when metadata is fetched */
    size?: number;
    contentType?: string;
    downloadUrl?: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(contentType?: string) {
    if (!contentType) return DescriptionIcon;
    if (contentType.startsWith("image/")) return ImageIcon;
    if (contentType.startsWith("video/")) return VideoLibraryIcon;
    if (contentType.startsWith("audio/")) return AudiotrackIcon;
    return DescriptionIcon;
}

function getExtension(name: string): string {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function breadcrumbSegments(path: string): { label: string; path: string }[] {
    if (!path || path === "/") return [{ label: "Root", path: "" }];
    const parts = path.split("/").filter(Boolean);
    const segments = [{ label: "Root", path: "" }];
    let accumulated = "";
    for (const part of parts) {
        accumulated = accumulated ? `${accumulated}/${part}` : part;
        segments.push({ label: part, path: accumulated });
    }
    return segments;
}

// ──────────────────────────────────────────────
// Upload Dialog
// ──────────────────────────────────────────────

function UploadDialog({
    open,
    currentPath,
    onClose,
    onUpload
}: {
    open: boolean;
    currentPath: string;
    onClose: () => void;
    onUpload: (files: File[]) => Promise<void>;
}) {
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFilesAdded = useCallback((files: File[]) => {
        setSelectedFiles(prev => [...prev, ...files]);
    }, []);

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

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()} maxWidth="md">
            <DialogContent className="p-0">
                <div className="p-4 border-b border-surface-accent-200 dark:border-surface-accent-700">
                    <Typography variant="h6">Upload Files</Typography>
                    <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark mt-1 block">
                        to <span className="font-mono text-primary">/{currentPath || "root"}</span>
                    </Typography>
                </div>

                <div className="p-4">
                    {/* Drop Zone */}
                    <FileUpload
                        accept={{} as Record<string, string[]>}
                        onFilesAdded={handleFilesAdded}
                        size="large"
                        uploadDescription={
                            <div className="flex flex-col items-center justify-center pointer-events-none mt-2">
                                <CloudUploadIcon className="text-surface-accent-400 mb-2 w-8 h-8" />
                                <Typography variant="h6" className="font-bold">
                                    Drop files here or click to browse
                                </Typography>
                                <Typography variant="caption" className="text-surface-accent-500 font-medium">
                                    Any file type supported
                                </Typography>
                            </div>
                        }
                    />

                    {error && (
                        <Typography variant="caption" className="text-red-500 mt-2 block whitespace-pre-line">
                            {error}
                        </Typography>
                    )}

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
                                                {formatFileSize(file.size)}
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
                <Button variant="text" onClick={handleClose} disabled={uploading}>
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

// ──────────────────────────────────────────────
// File preview panel
// ──────────────────────────────────────────────

function FilePreviewPanel({
    file,
    onClose,
    onDelete,
    downloadUrl
}: {
    file: StorageFile;
    onClose: () => void;
    onDelete: () => void;
    downloadUrl: string | null;
}) {
    const isImage = file.contentType?.startsWith("image/");
    const isVideo = file.contentType?.startsWith("video/");
    const isAudio = file.contentType?.startsWith("audio/");
    const FileIconComponent = getFileIcon(file.contentType);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <>
            <div className={cls(
                "flex flex-col h-full border-l",
                defaultBorderMixin,
                "bg-white dark:bg-surface-950"
            )}>
                {/* Header */}
                <div className={cls("flex items-center justify-between p-3 border-b shrink-0", defaultBorderMixin)}>
                    <Typography variant="body2" className="font-medium truncate flex-1 mr-2">
                        {file.name}
                    </Typography>
                    <div className="flex items-center gap-0.5">
                        {downloadUrl && (
                            <Tooltip title="Download">
                                <IconButton
                                    size="small"
                                    onClick={() => window.open(downloadUrl, "_blank")}
                                >
                                    <DownloadIcon size="smallest" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Delete">
                            <IconButton
                                size="small"
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <DeleteIcon size="smallest" />
                            </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon size="smallest" />
                        </IconButton>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 overflow-auto">
                    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-surface-50 dark:bg-surface-900 border-b border-surface-accent-200 dark:border-surface-accent-700">
                        {(() => {
                            const ext = getExtension(file.name)?.toLowerCase() || "";
                            const isImage = file.contentType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
                            const isVideo = file.contentType?.startsWith("video/") || ["mp4", "webm", "ogg", "mov"].includes(ext);
                            const isAudio = file.contentType?.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext);
                            const downloadUrl = file.downloadUrl;

                            if (isImage && downloadUrl) {
                                return (
                                    <img
                                        src={downloadUrl}
                                        alt={file.name}
                                        className="max-w-full max-h-[400px] object-contain rounded-md shadow-sm"
                                    />
                                );
                            } else if (isVideo && downloadUrl) {
                                return (
                                    <video
                                        src={downloadUrl}
                                        className="max-w-full max-h-[400px] rounded-md"
                                        controls
                                    />
                                );
                            } else if (isAudio && downloadUrl) {
                                return (
                                    <div className="flex flex-col items-center gap-4">
                                        <AudiotrackIcon className="text-surface-accent-400 w-10 h-10" />
                                        <audio src={downloadUrl} controls className="w-full max-w-xs" />
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="flex flex-col items-center gap-3 text-surface-accent-400">
                                        <FileIconComponent className="w-10 h-10" />
                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">
                                            No preview available
                                        </Typography>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-3">
                        <div>
                            <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-[10px] uppercase tracking-wider font-bold mb-1 block">
                                File Info
                            </Typography>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Typography variant="caption" className="text-surface-accent-500 text-[11px]">
                                    Name
                                </Typography>
                                <Typography variant="body2" className="text-[13px] break-all">
                                    {file.name}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="caption" className="text-surface-accent-500 text-[11px]">
                                    Type
                                </Typography>
                                <Typography variant="body2" className="text-[13px]">
                                    {file.contentType || "Unknown"}
                                </Typography>
                            </div>
                            {file.size !== undefined && (
                                <div>
                                    <Typography variant="caption" className="text-surface-accent-500 text-[11px]">
                                        Size
                                    </Typography>
                                    <Typography variant="body2" className="text-[13px]">
                                        {formatFileSize(file.size)}
                                    </Typography>
                                </div>
                            )}
                            <div>
                                <Typography variant="caption" className="text-surface-accent-500 text-[11px]">
                                    Extension
                                </Typography>
                                <Typography variant="body2" className="text-[13px] font-mono">
                                    {getExtension(file.name) || "—"}
                                </Typography>
                            </div>
                            <div className="col-span-2">
                                <Typography variant="caption" className="text-surface-accent-500 text-[11px]">
                                    Path
                                </Typography>
                                <Typography variant="body2" className="text-[13px] font-mono break-all">
                                    {file.fullPath}
                                </Typography>
                            </div>
                        </div>

                        {downloadUrl && (
                            <div className="pt-2">
                                <Typography variant="caption" className="text-surface-accent-500 text-[11px] block mb-1">
                                    URL
                                </Typography>
                                <div
                                    className="p-2 rounded bg-surface-100 dark:bg-surface-800 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                                    onClick={() => {
                                        navigator.clipboard.writeText(downloadUrl);
                                    }}
                                >
                                    <Typography variant="caption" className="font-mono text-[11px] break-all text-primary">
                                        {downloadUrl}
                                    </Typography>
                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-[10px] block mt-1">
                                        Click to copy
                                    </Typography>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <Typography variant="subtitle1" className="mb-2">
                        Delete File?
                    </Typography>
                    <Typography className="text-surface-accent-600 dark:text-surface-accent-400">
                        Are you sure you want to delete &quot;{file.name}&quot;?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        color="error"
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            onDelete();
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ──────────────────────────────────────────────
// Sidebar (folder tree)
// ──────────────────────────────────────────────

function StorageSidebar({
    folders,
    currentPath,
    onNavigate,
    loading
}: {
    folders: StorageFile[];
    currentPath: string;
    onNavigate: (path: string) => void;
    loading: boolean;
}) {
    const segments = breadcrumbSegments(currentPath);

    return (
        <div className={cls("flex flex-col h-full w-full bg-white dark:bg-surface-950 border-r", defaultBorderMixin)}>
            <div className={cls("p-3 border-b flex justify-between items-center bg-surface-50 dark:bg-surface-900 shrink-0", defaultBorderMixin)}>
                <Typography variant="caption" className="font-bold uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark">
                    Folders
                </Typography>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar p-1">
                {/* Folder tree */}
                <div
                    className={cls(
                        "flex items-center p-1.5 cursor-pointer rounded transition-colors",
                        currentPath === "" || !currentPath
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                            : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                    )}
                    onClick={() => onNavigate("")}
                >
                    <Icon iconKey="home" size="smallest" className="mr-1.5 shrink-0" />
                    <Typography variant="body2" className="text-xs truncate">Root</Typography>
                </div>

                {loading && folders.length === 0 ? (
                    <div className="flex justify-center p-4">
                        <CircularProgress size="small" />
                    </div>
                ) : (
                    <div className="mt-1 space-y-0.5">
                        {folders.map(folder => {
                            const isSelected = currentPath === folder.fullPath;
                            return (
                                <div
                                    key={folder.fullPath}
                                    className={cls(
                                        "flex items-center p-1.5 cursor-pointer rounded transition-colors group",
                                        isSelected
                                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                                            : "hover:bg-surface-100 dark:hover:bg-surface-800 text-text-secondary dark:text-text-secondary-dark"
                                    )}
                                    onClick={() => onNavigate(folder.fullPath)}
                                >
                                    <FolderIcon size="smallest" className="mr-1.5 shrink-0 text-amber-500 dark:text-amber-400" />
                                    <Typography variant="body2" className="text-xs truncate flex-1 min-w-0">
                                        {folder.name}
                                    </Typography>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Main StorageView Export
// ──────────────────────────────────────────────

export const StorageView = () => {
    const storageSource = useStorageSource();
    const snackbarController = useSnackbarController();

    // Navigation
    const [currentPath, setCurrentPath] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Contents
    const [folders, setFolders] = useState<StorageFile[]>([]);
    const [files, setFiles] = useState<StorageFile[]>([]);

    // Selection and preview
    const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
    const [selectedDownloadUrl, setSelectedDownloadUrl] = useState<string | null>(null);

    // Upload
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // View mode
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Resizable panels

    // Resizable panels
    const [sidebarSize, setSidebarSize] = useState(() => {
        try {
            const saved = localStorage.getItem("rebase_storage_sidebar_size");
            return saved !== null ? parseFloat(saved) : 18;
        } catch {
            return 18;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("rebase_storage_sidebar_size", sidebarSize.toString());
        } catch { /* noop */ }
    }, [sidebarSize]);

    // ── Fetch directory contents ──
    const fetchContents = useCallback(async (path: string) => {
        setLoading(true);
        setError(null);
        try {
            const result: StorageListResult = await storageSource.list(path);

            const folderItems: StorageFile[] = (result.prefixes ?? []).map(ref => ({
                name: ref.name,
                fullPath: ref.fullPath,
                isFolder: true
            }));

            // Build file items and fetch metadata for each
            const fileItems: StorageFile[] = await Promise.all(
                (result.items ?? []).map(async (ref) => {
                    try {
                        const downloadConfig = await storageSource.getDownloadURL(ref.fullPath);
                        return {
                            name: ref.name,
                            fullPath: ref.fullPath,
                            isFolder: false,
                            size: downloadConfig.metadata?.size,
                            contentType: downloadConfig.metadata?.contentType,
                            downloadUrl: downloadConfig.url ?? undefined
                        };
                    } catch {
                        return {
                            name: ref.name,
                            fullPath: ref.fullPath,
                            isFolder: false
                        };
                    }
                })
            );

            setFolders(folderItems);
            setFiles(fileItems);
        } catch (e) {
            console.error("Storage list error:", e);
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [storageSource]);

    useEffect(() => {
        fetchContents(currentPath);
    }, [currentPath, fetchContents]);

    // Navigate to path
    const handleNavigate = useCallback((path: string) => {
        setCurrentPath(path);
        setSelectedFile(null);
        setSelectedDownloadUrl(null);
    }, []);

    // Navigate up one level
    const handleNavigateUp = useCallback(() => {
        const parts = currentPath.split("/").filter(Boolean);
        parts.pop();
        handleNavigate(parts.join("/"));
    }, [currentPath, handleNavigate]);

    // Select a file for preview
    const handleSelectFile = useCallback(async (file: StorageFile) => {
        setSelectedFile(file);
        if (file.downloadUrl) {
            setSelectedDownloadUrl(file.downloadUrl);
        } else {
            try {
                const config = await storageSource.getDownloadURL(file.fullPath);
                setSelectedDownloadUrl(config.url);
            } catch {
                setSelectedDownloadUrl(null);
            }
        }
    }, [storageSource]);

    // Upload files
    const handleUpload = useCallback(async (uploadFiles: File[]) => {
        for (const file of uploadFiles) {
            await storageSource.uploadFile({
                file,
                fileName: file.name,
                path: currentPath || undefined
            });
        }
        snackbarController.open({
            type: "success",
            message: `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} uploaded successfully`
        });
        fetchContents(currentPath);
    }, [storageSource, currentPath, snackbarController, fetchContents]);

    // Delete a file
    const handleDeleteFile = useCallback(async (file: StorageFile) => {
        try {
            await storageSource.deleteFile(file.fullPath);
            snackbarController.open({ type: "success", message: `"${file.name}" deleted` });
            setSelectedFile(null);
            setSelectedDownloadUrl(null);
            fetchContents(currentPath);
        } catch (e) {
            snackbarController.open({ type: "error", message: e instanceof Error ? e.message : String(e) });
        }
    }, [storageSource, currentPath, snackbarController, fetchContents]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchContents(currentPath);
    }, [currentPath, fetchContents]);

    const segments = breadcrumbSegments(currentPath);

    // ── Render file grid/list ──
    const renderContents = () => {
        if (loading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <CircularProgress size="medium" />
                        <Typography variant="body2" className="mt-4 text-text-secondary dark:text-text-secondary-dark font-mono tracking-tight animate-pulse">
                            Loading...
                        </Typography>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-grow flex items-center justify-center p-6 overflow-auto">
                    <ErrorView title="Error loading storage" error={error} onRetry={handleRefresh} />
                </div>
            );
        }

        const allItems = [...folders, ...files];

        if (allItems.length === 0) {
            return (
                <div className="flex-grow flex items-center justify-center text-text-disabled dark:text-text-disabled-dark">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <Typography variant="body2">
                            This folder is empty
                        </Typography>
                        <Button className="mt-3" onClick={() => setUploadDialogOpen(true)}>
                            <AddIcon size="small" />
                            Upload files
                        </Button>
                    </div>
                </div>
            );
        }

        if (viewMode === "list") {
            return (
                <div className="flex-grow overflow-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={cls("border-b text-left text-[10px] uppercase tracking-wider text-text-disabled dark:text-text-disabled-dark", defaultBorderMixin)}>
                                <th className="px-4 py-2 font-bold">Name</th>
                                <th className="px-4 py-2 font-bold w-24">Type</th>
                                <th className="px-4 py-2 font-bold w-24 text-right">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {folders.map(folder => (
                                <tr
                                    key={folder.fullPath}
                                    className="hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-colors border-b border-surface-100 dark:border-surface-800/50"
                                    onClick={() => handleNavigate(folder.fullPath)}
                                >
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <FolderIcon size="smallest" className="text-amber-500 dark:text-amber-400 shrink-0" />
                                            <Typography variant="body2" className="text-[13px] font-medium truncate">
                                                {folder.name}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark">
                                            Folder
                                        </Typography>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark">
                                            —
                                        </Typography>
                                    </td>
                                </tr>
                            ))}
                            {files.map(file => {
                                const FileIconComp = getFileIcon(file.contentType);
                                const isSelected = selectedFile?.fullPath === file.fullPath;
                                return (
                                    <tr
                                        key={file.fullPath}
                                        className={cls(
                                            "cursor-pointer transition-colors border-b border-surface-100 dark:border-surface-800/50",
                                            isSelected
                                                ? "bg-primary/5 dark:bg-primary/10"
                                                : "hover:bg-surface-100 dark:hover:bg-surface-800"
                                        )}
                                        onClick={() => handleSelectFile(file)}
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <FileIconComp size="smallest" className="text-surface-accent-400 shrink-0" />
                                                <Typography variant="body2" className="text-[13px] truncate">
                                                    {file.name}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark">
                                                {getExtension(file.name) || file.contentType?.split("/")[1]?.toUpperCase() || "—"}
                                            </Typography>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark font-mono text-[11px]">
                                                {file.size !== undefined ? formatFileSize(file.size) : "—"}
                                            </Typography>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Grid view
        return (
            <div className="flex-grow overflow-auto p-4">
                {/* Folder cards */}
                {folders.length > 0 && (
                    <div className="mb-4">
                        <Typography variant="caption" className="text-[10px] uppercase tracking-wider font-bold text-text-disabled dark:text-text-disabled-dark mb-2 block">
                            Folders
                        </Typography>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {folders.map(folder => (
                                <div
                                    key={folder.fullPath}
                                    className={cls(
                                        "rounded-lg p-3 cursor-pointer transition-all duration-150 border",
                                        defaultBorderMixin,
                                        "hover:bg-surface-100 dark:hover:bg-surface-800 hover:shadow-sm",
                                        "flex items-center gap-2"
                                    )}
                                    onClick={() => handleNavigate(folder.fullPath)}
                                >
                                    <FolderIcon size="small" className="text-amber-500 dark:text-amber-400 shrink-0" />
                                    <Typography variant="body2" className="text-[13px] font-medium truncate">
                                        {folder.name}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* File cards */}
                {files.length > 0 && (
                    <div>
                        <Typography variant="caption" className="text-[10px] uppercase tracking-wider font-bold text-text-disabled dark:text-text-disabled-dark mb-2 block">
                            Files ({files.length})
                        </Typography>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {files.map(file => {
                                const FileIconComp = getFileIcon(file.contentType);
                                const ext = getExtension(file.name)?.toLowerCase() || "";
                                const isImage = file.contentType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
                                const isSelected = selectedFile?.fullPath === file.fullPath;

                                return (
                                    <div
                                        key={file.fullPath}
                                        className={cls(
                                            "rounded-lg overflow-hidden cursor-pointer transition-all duration-150 border group",
                                            defaultBorderMixin,
                                            "hover:shadow-md hover:-translate-y-0.5",
                                            isSelected && "ring-2 ring-primary"
                                        )}
                                        onClick={() => handleSelectFile(file)}
                                    >
                                        {/* Thumbnail or icon */}
                                        <div className="aspect-square relative overflow-hidden bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                            {isImage && file.downloadUrl ? (
                                                <img
                                                    src={file.downloadUrl}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <FileIconComp className="text-surface-accent-400 dark:text-surface-accent-500 w-8 h-8" />
                                            )}

                                            {/* Extension badge */}
                                            {getExtension(file.name) && (
                                                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/50 text-white backdrop-blur-sm">
                                                    {getExtension(file.name)}
                                                </div>
                                            )}

                                            {/* Hover overlay */}
                                            <div className={cls(
                                                "absolute inset-0 bg-black/0 group-hover:bg-black/10",
                                                "transition-colors duration-200"
                                            )} />
                                        </div>

                                        {/* Name & size */}
                                        <div className="p-2.5">
                                            <Typography variant="body2" className="text-[12px] font-medium truncate text-surface-900 dark:text-white">
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" color="secondary" className="truncate block mt-0.5 text-[11px]">
                                                {file.size !== undefined ? formatFileSize(file.size) : "—"}
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-surface-950 overflow-hidden text-text-primary dark:text-text-primary-dark">
            <ResizablePanels
                orientation="horizontal"
                panelSizePercent={sidebarSize}
                onPanelSizeChange={setSidebarSize}
                minPanelSizePx={180}
                firstPanel={
                    <StorageSidebar
                        folders={folders}
                        currentPath={currentPath}
                        onNavigate={handleNavigate}
                        loading={loading}
                    />
                }
                secondPanel={
                    <div className="flex h-full w-full">
                        {/* Main content */}
                        <div className="flex-grow flex flex-col min-w-0 h-full">
                            {/* Toolbar */}
                            <div className={cls("flex items-center justify-between pr-2 border-b bg-white dark:bg-surface-950 shrink-0", defaultBorderMixin)}>
                                <div className="flex items-center gap-1.5 flex-grow overflow-hidden px-3 py-2">
                                    {/* Breadcrumbs */}
                                    {currentPath && (
                                        <Tooltip title="Go up">
                                            <IconButton size="small" onClick={handleNavigateUp}>
                                                <ArrowBackIcon size="smallest" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                                        {segments.map((seg, i) => (
                                            <React.Fragment key={seg.path}>
                                                {i > 0 && (
                                                    <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark mx-0.5">/</Typography>
                                                )}
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    className={cls(
                                                        "px-1.5 py-0.5 min-h-0 min-w-0 h-6 text-xs whitespace-nowrap normal-case font-normal",
                                                        i === segments.length - 1
                                                            ? "text-text-primary dark:text-text-primary-dark font-medium"
                                                            : "text-text-secondary dark:text-text-secondary-dark"
                                                    )}
                                                    onClick={() => handleNavigate(seg.path)}
                                                >
                                                    {seg.label}
                                                </Button>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <div className="flex-1" />

                                    {/* File count */}
                                    {!loading && (
                                        <Chip size="small" className="shrink-0 text-[10px]">
                                            {files.length} file{files.length !== 1 ? "s" : ""}
                                            {folders.length > 0 ? `, ${folders.length} folder${folders.length !== 1 ? "s" : ""}` : ""}
                                        </Chip>
                                    )}
                                </div>

                                <div className="flex shrink-0 items-center justify-end gap-1.5 pr-1">

                                    <Tooltip title="Grid view">
                                        <IconButton
                                            size="small"
                                            onClick={() => setViewMode("grid")}
                                            className={cls(viewMode === "grid" && "bg-surface-100 dark:bg-surface-800")}
                                        >
                                            <Icon iconKey="apps" size="smallest" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="List view">
                                        <IconButton
                                            size="small"
                                            onClick={() => setViewMode("list")}
                                            className={cls(viewMode === "list" && "bg-surface-100 dark:bg-surface-800")}
                                        >
                                            <Icon iconKey="list" size="smallest" />
                                        </IconButton>
                                    </Tooltip>

                                    <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-0.5" />

                                    <Tooltip title="Refresh">
                                        <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                                            <RefreshIcon size="smallest" />
                                        </IconButton>
                                    </Tooltip>

                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => setUploadDialogOpen(true)}
                                    >
                                        <CloudUploadIcon size="smallest" className="mr-1" />
                                        Upload
                                    </Button>
                                </div>
                            </div>

                            {/* File grid / list */}
                            <div className="flex-grow flex flex-col overflow-hidden min-h-0">
                                {renderContents()}
                            </div>

                            {/* Status bar */}
                            <div className={cls("px-4 py-1.5 border-t bg-surface-50 dark:bg-surface-900 flex items-center justify-between shrink-0", defaultBorderMixin)}>
                                <div className="flex items-center gap-4 text-[11px]">
                                    <span className="text-text-disabled dark:text-text-disabled-dark font-bold uppercase tracking-tighter">
                                        Path
                                    </span>
                                    <span className="font-mono text-text-secondary dark:text-text-secondary-dark">
                                        /{currentPath || ""}
                                    </span>
                                </div>
                                {selectedFile && (
                                    <div className="text-[11px] text-text-secondary dark:text-text-secondary-dark">
                                        Selected: <span className="font-mono">{selectedFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview panel */}
                        {selectedFile && (
                            <div className="w-80 lg:w-96 shrink-0">
                                <FilePreviewPanel
                                    file={selectedFile}
                                    downloadUrl={selectedDownloadUrl}
                                    onClose={() => {
                                        setSelectedFile(null);
                                        setSelectedDownloadUrl(null);
                                    }}
                                    onDelete={() => handleDeleteFile(selectedFile)}
                                />
                            </div>
                        )}
                    </div>
                }
            />

            {/* Upload Dialog */}
            <UploadDialog
                open={uploadDialogOpen}
                currentPath={currentPath}
                onClose={() => setUploadDialogOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    );
};
