import React, { useEffect } from "react";

import {
    renderSkeletonImageThumbnail
} from "../property_previews/SkeletonComponent";
import { UrlComponentPreview } from "./UrlComponentPreview";
import { PreviewSize } from "../index";
import { useStorageSource } from "../../hooks";
import { DownloadConfig, FileType } from "../../models";

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
    return downloadConfig
        ? <UrlComponentPreview fileType={filetype}
                               url={downloadConfig.url}
                               size={size}/>
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
