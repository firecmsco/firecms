import { EntitySchema, StringProperty } from "../models";
import React, { ReactElement, useEffect } from "react";
import { getDownloadURL } from "../firebase";
import { renderSkeletonImageThumbnail } from "./SkeletonComponent";
import { PreviewSize } from "./PreviewComponentProps";

interface StorageThumbnailProps {
    storagePathOrDownloadUrl: string | undefined;
    property: StringProperty;
    size: PreviewSize;
    renderUrlComponent: (property: StringProperty,
                         url: any,
                         size: PreviewSize,
                         entitySchema: EntitySchema) => ReactElement;
    entitySchema: EntitySchema;
}

export default function StorageThumbnail({ storagePathOrDownloadUrl, property, renderUrlComponent, size, entitySchema }: StorageThumbnailProps) {

    const [url, setUrl] = React.useState<string>();
    let unmounted = false;

    useEffect(() => {
        if (property.config?.storageMeta?.storeUrl)
            setUrl(storagePathOrDownloadUrl);
        else if (storagePathOrDownloadUrl)
            getDownloadURL(storagePathOrDownloadUrl)
                .then(function(downloadURL) {
                    console.debug("File available at", downloadURL);
                    if (!unmounted)
                        setUrl(downloadURL);
                });
        return () => {
            unmounted = true;
        };
    }, [storagePathOrDownloadUrl]);

    return url ?
        renderUrlComponent(property, url, size, entitySchema) :
        renderSkeletonImageThumbnail(size);
}
