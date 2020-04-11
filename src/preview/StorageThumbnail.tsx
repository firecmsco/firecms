import { StringProperty } from "../models";
import React, { useEffect } from "react";
import { getDownloadURL } from "../firebase";
import { renderUrlComponent } from "./index";

interface StorageThumbnailProps {
    storagePath: string | undefined;
    property: StringProperty;
}

export default function StorageThumbnail({ storagePath, property }: StorageThumbnailProps) {

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
