import React, { CSSProperties, useMemo, useState } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { PreviewSize } from "../index";
import { getThumbnailMeasure } from "../util";

/**
 * @category Preview components
 */
export interface ImagePreviewProps {
    size: PreviewSize,
    url: string
}

/**
 * @category Preview components
 */
export function ImagePreview({ size, url }: ImagePreviewProps) {

    const [onHover, setOnHover] = useState(false);

    const imageSize = useMemo(() => getThumbnailMeasure(size), [size]);

    const theme = useTheme();

    if (size === "tiny") {
        return (
            <img src={url}
                 key={"tiny_image_preview_" + url}
                 style={{
                     position: "relative",
                     objectFit: "cover",
                     width: imageSize,
                     height: imageSize,
                     borderRadius: "4px",
                     maxHeight: "100%"
                 }}/>
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
            sx={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: imageSize,
                height: imageSize
            }}
            key={"image_preview_" + url}
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}>

            <img src={url}
                 style={imageStyle}/>

            {onHover && (
                <a
                    style={{
                        borderRadius: "9999px",
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        backgroundColor: theme.palette.common.white
                    }}
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank">
                    <IconButton
                        size={"small"}
                        onClick={(e) => e.stopPropagation()}>
                        <OpenInNewIcon htmlColor={"#666"} fontSize={"small"}/>
                    </IconButton>
                </a>
            )}
        </Box>
    );
}
