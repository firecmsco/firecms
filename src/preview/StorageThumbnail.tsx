import { StringProperty } from "../models";
import React, { ReactElement, useEffect } from "react";
import { getDownloadURL } from "../firebase";

interface StorageThumbnailProps {
    storagePath: string | undefined;
    property: StringProperty;
    renderUrlComponent: (property: StringProperty, url: any) => ReactElement;
}

export default function StorageThumbnail({ storagePath, property, renderUrlComponent }: StorageThumbnailProps) {

    const [url, setUrl] = React.useState<string>();

    useEffect(() => {
        if (storagePath)
            getDownloadURL(storagePath).then(function(downloadURL) {
                console.debug("File available at", downloadURL);
                setUrl(downloadURL);
            });
    }, [storagePath]);

    return url ? renderUrlComponent(property, url) :
        <React.Fragment></React.Fragment>;
}
