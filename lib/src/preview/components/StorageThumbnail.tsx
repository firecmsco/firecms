import React, { useEffect } from "react";

import {
    renderSkeletonImageThumbnail
} from "../property_previews/SkeletonPropertyComponent";
import { UrlComponentPreview } from "./UrlComponentPreview";
import { useStorageSource } from "../../hooks";
import { DownloadConfig, FileType } from "../../types";
import { PreviewSize } from "../PropertyPreviewProps";

type StorageThumbnailProps = {
    storagePathOrDownloadUrl: string;
    storeUrl: boolean;
    size: PreviewSize;
};

/**
 * @category Preview components
 */
export const StorageThumbnail = React.memo<StorageThumbnailProps>(StorageThumbnailInternal, areEqual) as React.FunctionComponent<StorageThumbnailProps>;

function areEqual(prevProps: StorageThumbnailProps, nextProps: StorageThumbnailProps) {
    return prevProps.size === nextProps.size &&
        prevProps.storagePathOrDownloadUrl === nextProps.storagePathOrDownloadUrl &&
        prevProps.storeUrl === nextProps.storeUrl;
}

const URL_CACHE: Record<string, DownloadConfig> = {};

export function StorageThumbnailInternal({
                                             storeUrl,
                                             storagePathOrDownloadUrl,
                                             size
                                         }: StorageThumbnailProps) {
    const storage = useStorageSource();

    const [downloadConfig, setDownloadConfig] = React.useState<DownloadConfig>(URL_CACHE[storagePathOrDownloadUrl]);

    useEffect(() => {
        if (!storagePathOrDownloadUrl)
            return;
        let unmounted = false;
        storage.getDownloadURL(storagePathOrDownloadUrl)
            .then(function (downloadConfig) {
                if (!unmounted) {
                    setDownloadConfig(downloadConfig);
                    URL_CACHE[storagePathOrDownloadUrl] = downloadConfig;
                }
            });
        return () => {
            unmounted = true;
        };
    }, [storagePathOrDownloadUrl]);

    if (!storagePathOrDownloadUrl) return null;

    const filetype = downloadConfig?.metadata ? getFiletype(downloadConfig?.metadata.contentType) : undefined;
    const previewType = filetype?.startsWith("image")
        ? "image"
        : (filetype?.startsWith("video")
            ? "video"
            : (filetype?.startsWith("audio") ? "audio" : "file"));

    return downloadConfig
        ? <UrlComponentPreview previewType={previewType}
                               url={downloadConfig.url}
                               size={size}
                               hint={storagePathOrDownloadUrl}/>
        : renderSkeletonImageThumbnail(size);
}

function getFiletype(input: string): FileType {
    if (input.startsWith("image")) return "image/*";
    else if (input.startsWith("video")) return "video/*";
    else if (input.startsWith("audio")) return "audio/*";
    else if (input.startsWith("application")) return "application/*";
    else if (input.startsWith("text")) return "text/*";
    else if (input.startsWith("font")) return "font/*";
    else return input;
}
