import React, { CSSProperties, useMemo, useState } from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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
export function ImagePreview({
                                 size,
                                 url
                             }: ImagePreviewProps) {

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
                     borderRadius: theme.shape.borderRadius,
                     maxHeight: "100%"
                 }}/>
        );
    }

    const imageStyle: CSSProperties =
        {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: theme.shape.borderRadius
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

            {onHover && <>

                {navigator && <Tooltip title="Copy url to clipboard">
                    <Box sx={{
                        borderRadius: "9999px",
                        position: "absolute",
                        bottom: -4,
                        right: 32,
                        backgroundColor: theme.palette.background.default
                    }}>
                        <IconButton
                            size={"small"}
                            onClick={(e) => {
                                e.stopPropagation();
                                return navigator.clipboard.writeText(url);
                            }}>
                            <ContentCopyIcon htmlColor={"#666"}
                                             fontSize={"small"}/>
                        </IconButton>
                    </Box>
                </Tooltip>}

                <Tooltip title="Open image in new tab">
                    <a
                        style={{
                            borderRadius: "9999px",
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            backgroundColor: theme.palette.background.default
                        }}
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank">
                        <IconButton
                            size={"small"}
                            onClick={(e) => e.stopPropagation()}>
                            <OpenInNewIcon htmlColor={"#666"}
                                           fontSize={"small"}/>
                        </IconButton>
                    </a>
                </Tooltip>
            </>
            }
        </Box>
    );
}
