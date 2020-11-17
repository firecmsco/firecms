import React, { CSSProperties, useState } from "react";
import { Box, IconButton } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getThumbnailMeasure, PreviewSize } from "./PreviewComponentProps";

type ImagePreviewProps = { size: PreviewSize, url: string };

function ImagePreview({ size, url }: ImagePreviewProps) {

    const [onHover, setOnHover] = useState(false);

    const imageSize = getThumbnailMeasure(size);

    if (size === "tiny") {
        return (
            <img src={url}
                 key={"tiny_image_preview_" + url}
                 style={{
                     position: "relative",
                     objectFit: "cover",
                     width: imageSize,
                     height: imageSize,
                     borderRadius: "4px"
                 }
                 }/>
        );
    }

    const imageStyle: CSSProperties =
        {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "4px"
        };

    return (
        <Box
            key={"image_preview_" + url}
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "100%"
            }}

            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            width={imageSize}
            height={imageSize}>

            <img src={url}
                 style={imageStyle}/>

            {onHover && (
                <a style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4
                }}
                   href={url}
                   rel="noopener noreferrer"
                   target="_blank"
                   onClick={(e) => e.stopPropagation()}
                >
                    <IconButton size={"small"}
                                style={{ backgroundColor: "white" }}>
                        <OpenInNewIcon fontSize={"small"}/>
                    </IconButton>
                </a>
            )}
        </Box>

    );
}

export default ImagePreview;
