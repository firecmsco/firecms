import React, { useEffect } from "react";
import { renderSkeletonImageThumbnail } from "./SkeletonComponent";
import {

    PreviewComponentProps
} from "../../models";
import { UrlComponentPreview } from "./UrlComponentPreview";
import { getDownloadURL } from "../../models";

export function StorageThumbnail({ name,
                                             value,
                                             property,
                                             size }: PreviewComponentProps<string> ) {

    const storagePathOrDownloadUrl = value;

    if (!storagePathOrDownloadUrl) return null;

    const [url, setUrl] = React.useState<string>();

    useEffect(() => {
        let unmounted = false;
        if (property.config?.storageMeta?.storeUrl)
            setUrl(storagePathOrDownloadUrl);
        else if (storagePathOrDownloadUrl)
            getDownloadURL(storagePathOrDownloadUrl)
                .then(function(downloadURL) {
                    if (!unmounted)
                        setUrl(downloadURL);
                });
        return () => {
            unmounted = true;
        };
    }, [storagePathOrDownloadUrl]);

    return url ?
        <UrlComponentPreview name={name}
                          value={url}
                          property={property}
                          size={size}/> :
        renderSkeletonImageThumbnail(size);
}
