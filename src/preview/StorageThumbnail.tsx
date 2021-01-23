import React, { useEffect } from "react";
import { renderSkeletonImageThumbnail } from "./components/SkeletonComponent";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../models/preview_component_props";
import { UrlComponentPreview } from "./components/UrlComponentPreview";
import { getDownloadURL } from "../models";

export default function StorageThumbnail({ name,
                                             value,
                                             property,
                                             PreviewComponent,
                                             size,
                                             entitySchema }: PreviewComponentProps<string> & PreviewComponentFactoryProps) {

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
                          size={size}
                          entitySchema={entitySchema}/> :
        renderSkeletonImageThumbnail(size);
}
