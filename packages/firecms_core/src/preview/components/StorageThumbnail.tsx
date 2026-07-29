import React, { useEffect } from "react";

import { renderSkeletonImageThumbnail } from "../property_previews/SkeletonPropertyComponent";
import { UrlComponentPreview } from "./UrlComponentPreview";
import { useStorageSource } from "../../hooks";
import { DownloadConfig, FileType } from "../../types";
import { PreviewSize } from "../PropertyPreviewProps";
import { ErrorView } from "../../components";
import { getPreviewTypeFromUrl, isAbsoluteHttpUrl } from "../../util/urls";

type StorageThumbnailProps = {
    storagePathOrDownloadUrl: string;
    storeUrl: boolean;
    size: PreviewSize;
    interactive?: boolean;
    fill?: boolean;
};

/**
 * @group Preview components
 */
export const StorageThumbnail = React.memo<StorageThumbnailProps>(StorageThumbnailInternal, areEqual) as React.FunctionComponent<StorageThumbnailProps>;

function areEqual(prevProps: StorageThumbnailProps, nextProps: StorageThumbnailProps) {
    return prevProps.size === nextProps.size &&
        prevProps.storagePathOrDownloadUrl === nextProps.storagePathOrDownloadUrl &&
        prevProps.storeUrl === nextProps.storeUrl &&
        prevProps.interactive === nextProps.interactive &&
        prevProps.fill === nextProps.fill;
}

const URL_CACHE: Record<string, DownloadConfig> = {};

export function StorageThumbnailInternal({
    storeUrl,
    interactive,
    storagePathOrDownloadUrl,
    size,
    fill
}: StorageThumbnailProps) {

    const [error, setError] = React.useState<Error | undefined>(undefined);
    const storage = useStorageSource();

    /**
     * The saved value may already be a resolved download URL instead of a
     * storage path: either because the property is configured with
     * `storeUrl: true`, or because the value was written directly in the
     * datasource pointing to an externally hosted file. Such values can be
     * previewed as they are, and must not be handed over to the storage source,
     * which can only resolve paths of its own bucket.
     */
    const valueIsUrl = storeUrl || isAbsoluteHttpUrl(storagePathOrDownloadUrl);

    const [downloadConfig, setDownloadConfig] = React.useState<DownloadConfig>(URL_CACHE[storagePathOrDownloadUrl]);

    useEffect(() => {
        if (!storagePathOrDownloadUrl || valueIsUrl)
            return;
        let unmounted = false;
        storage.getDownloadURL(storagePathOrDownloadUrl)
            .then(function (downloadConfig) {
                if (!unmounted) {
                    setDownloadConfig(downloadConfig);
                    URL_CACHE[storagePathOrDownloadUrl] = downloadConfig;
                }
            }).catch(setError);
        return () => {
            unmounted = true;
        };
    }, [storagePathOrDownloadUrl, valueIsUrl]);

    if (!storagePathOrDownloadUrl) return null;

    if (valueIsUrl) {
        // There is no storage metadata for a value that is already a URL, so the
        // preview type is inferred from its file extension when possible.
        return <UrlComponentPreview previewType={getPreviewTypeFromUrl(storagePathOrDownloadUrl) ?? "file"}
            url={storagePathOrDownloadUrl}
            interactive={interactive}
            size={size}
            fill={fill}
            hint={storagePathOrDownloadUrl} />;
    }

    const filetype = downloadConfig?.metadata ? getFiletype(downloadConfig?.metadata.contentType) : undefined;
    const previewType = filetype?.startsWith("image")
        ? "image"
        : (filetype?.startsWith("video")
            ? "video"
            : (filetype?.startsWith("audio") ? "audio" : "file"));

    if (downloadConfig?.fileNotFound)
        return <ErrorView error={"File not found"}></ErrorView>

    return downloadConfig?.url
        ? <UrlComponentPreview previewType={previewType}
            url={downloadConfig.url}
            interactive={interactive}
            size={size}
            fill={fill}
            hint={storagePathOrDownloadUrl} />
        : renderSkeletonImageThumbnail(size, fill);
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
