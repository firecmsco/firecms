import React from "react";
import {
    Card,
    Typography,
    cls,
    ImageIcon,
    DescriptionIcon,
    VideoLibraryIcon,
    AudiotrackIcon,
    CheckIcon,
    defaultBorderMixin
} from "@firecms/ui";
import { MediaAsset } from "../types";

export interface MediaAssetCardProps {
    asset: MediaAsset;
    viewMode: "grid" | "list";
    onClick: () => void;
    selected?: boolean;
    /** Preferred thumbnail size to display (e.g., "small", "medium") */
    thumbnailSize?: string;
}

/**
 * Card component for displaying a media asset in the grid or list.
 */
export function MediaAssetCard({
    asset,
    viewMode,
    onClick,
    selected,
    thumbnailSize = "small"
}: MediaAssetCardProps) {
    const isImage = asset.mimeType.startsWith("image/");
    const isVideo = asset.mimeType.startsWith("video/");
    const isAudio = asset.mimeType.startsWith("audio/");

    const FileIcon = isImage ? ImageIcon
        : isVideo ? VideoLibraryIcon
            : isAudio ? AudiotrackIcon
                : DescriptionIcon;

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Use thumbnail if available, fallback to downloadURL
    const imageUrl = asset.thumbnails?.[thumbnailSize] ?? asset.downloadURL;

    const thumbnail = isImage && imageUrl ? (
        <img
            src={imageUrl}
            alt={asset.altText || asset.fileName}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
        />
    ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <FileIcon size="large" className="text-surface-400 dark:text-surface-500" />
        </div>
    );

    if (viewMode === "list") {
        return (
            <div
                className={cls(
                    "p-3 cursor-pointer flex items-center gap-3 rounded-lg",
                    "hover:bg-surface-100 dark:hover:bg-surface-800",
                    "transition-colors duration-150",
                    `border ${defaultBorderMixin}`,
                    selected && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={onClick}
            >
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-surface-100 dark:bg-surface-800">
                    {thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                    <Typography variant="body2" className="font-medium truncate text-surface-900 dark:text-white">
                        {asset.title || asset.fileName}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        {formatSize(asset.size)} • {asset.mimeType.split("/")[1]?.toUpperCase()}
                    </Typography>
                </div>
                {selected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <CheckIcon size="smallest" className="text-white" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <Card
            className={cls(
                "cursor-pointer overflow-hidden group relative",
                "transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                selected && "ring-2 ring-primary"
            )}
            onClick={onClick}
        >
            <div className="aspect-square relative overflow-hidden bg-surface-100 dark:bg-surface-800">
                {thumbnail}

                {/* Hover overlay */}
                <div className={cls(
                    "absolute inset-0 bg-black/0 group-hover:bg-black/20",
                    "transition-colors duration-200"
                )} />

                {/* Selection indicator */}
                {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                        <CheckIcon size="smallest" className="text-white" />
                    </div>
                )}
            </div>

            <div className="p-3">
                <Typography variant="body2" className="font-medium truncate text-surface-900 dark:text-white">
                    {asset.title || asset.fileName}
                </Typography>
                <Typography variant="caption" color="secondary" className="truncate block mt-0.5">
                    {formatSize(asset.size)} • {asset.mimeType.split("/")[1]?.toUpperCase()}
                </Typography>
            </div>
        </Card>
    );
}
