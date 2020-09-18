import { StringProperty } from "../models";
import React, { ReactElement, useEffect } from "react";
import { getDownloadURL } from "../firebase";
import { renderImageThumbnail } from "./SkeletonComponent";

interface StorageThumbnailProps {
    storagePathOrDownloadUrl: string | undefined;
    property: StringProperty;
    small: boolean;
    renderUrlComponent: (property: StringProperty, url: any, small: boolean) => ReactElement;
}

export default function StorageThumbnail({ storagePathOrDownloadUrl, property, renderUrlComponent, small }: StorageThumbnailProps) {

    const [url, setUrl] = React.useState<string>();

    useEffect(() => {
        if (property.config?.storageMeta?.storeUrl)
            setUrl(storagePathOrDownloadUrl);
        else if (storagePathOrDownloadUrl)
            getDownloadURL(storagePathOrDownloadUrl).then(function(downloadURL) {
                console.debug("File available at", downloadURL);
                setUrl(downloadURL);
            });
    }, [storagePathOrDownloadUrl]);

    return url ?
        renderUrlComponent(property, url, small) :
        renderImageThumbnail(small);
}
