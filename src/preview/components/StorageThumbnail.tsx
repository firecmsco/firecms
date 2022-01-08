import React, { useEffect } from "react";

import { renderSkeletonImageThumbnail } from "./SkeletonComponent";
import { UrlComponentPreview } from "./UrlComponentPreview";
import { PreviewComponentProps } from "../internal";
import { useStorageSource } from "../../hooks";

/**
 * @category Preview components
 */
export const StorageThumbnail = React.memo<PreviewComponentProps<string>>(StorageThumbnailInternal, areEqual) as React.FunctionComponent<PreviewComponentProps<string>>;

function areEqual(prevProps: PreviewComponentProps<string>, nextProps: PreviewComponentProps<string>) {
    return prevProps.name === nextProps.name &&
        prevProps.size === nextProps.size &&
        prevProps.height === nextProps.height &&
        prevProps.width === nextProps.width &&
        prevProps.value === nextProps.value;
}

const URL_CACHE: Record<string, string> = {};

export function StorageThumbnailInternal({
                                             name,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<string>) {
    const storage = useStorageSource();

    const storagePathOrDownloadUrl = value;

    const [url, setUrl] = React.useState<string>(URL_CACHE[storagePathOrDownloadUrl]);


    useEffect(() => {
        if (!storagePathOrDownloadUrl)
            return;
        let unmounted = false;
        if (property.config?.storageMeta?.storeUrl) {
            setUrl(storagePathOrDownloadUrl);
            URL_CACHE[storagePathOrDownloadUrl] = storagePathOrDownloadUrl;
        } else if (storagePathOrDownloadUrl)
            storage.getDownloadURL(storagePathOrDownloadUrl)
                .then(function (downloadURL) {
                    if (!unmounted) {
                        setUrl(downloadURL);
                        URL_CACHE[storagePathOrDownloadUrl] = downloadURL;
                    }
                });
        return () => {
            unmounted = true;
        };
    }, [property.config?.storageMeta?.storeUrl, storagePathOrDownloadUrl]);

    if (!storagePathOrDownloadUrl) return null;

    return url
        ? <UrlComponentPreview name={name}
                             value={url}
                             property={property}
                             size={size}/>
        : renderSkeletonImageThumbnail(size);
}
