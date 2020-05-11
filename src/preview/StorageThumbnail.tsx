import { StringProperty } from "../models";
import React, { ReactElement, useEffect } from "react";
import { getDownloadURL } from "../firebase";

interface StorageThumbnailProps {
    storagePath: string | undefined;
    property: StringProperty;
    small:boolean;
    renderUrlComponent: (property: StringProperty, url: any, small:boolean) => ReactElement;
}

export default function StorageThumbnail({ storagePath, property, renderUrlComponent, small }: StorageThumbnailProps) {

    const [url, setUrl] = React.useState<string>();

    useEffect(() => {
        if (storagePath)
            getDownloadURL(storagePath).then(function(downloadURL) {
                console.debug("File available at", downloadURL);
                setUrl(downloadURL);
            });
    }, [storagePath]);

    return url ? renderUrlComponent(property, url, small) :
        <React.Fragment></React.Fragment>;
}
