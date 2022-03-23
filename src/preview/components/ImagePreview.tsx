import React, { CSSProperties, useMemo, useState } from "react";
import clsx from "clsx";
import { IconButton, Theme, Tooltip } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { PreviewSize } from "../../preview";
import { getThumbnailMeasure } from "../util";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";


const useStyles = makeStyles<Theme, { imageSize: number }>(theme => createStyles({
        image: {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "4px"
        },
        imageWrap: {
            position: "relative",
            maxWidth: "100%",
            maxHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: ({ imageSize }) => imageSize,
            height: ({ imageSize }) => imageSize
        },
        imageTiny: {
            position: "relative",
            objectFit: "cover",
            width: ({ imageSize }) => imageSize,
            height: ({ imageSize }) => imageSize,
            borderRadius: "4px",
            maxHeight: "100%"
        },
        copyIcon: {
            borderRadius: "9999px",
            position: "absolute",
            bottom: -4,
            right: 32,
            backgroundColor: theme.palette.common.white
        },
        previewIcon: {
            borderRadius: "9999px",
            position: "absolute",
            bottom: -4,
            right: -4,
            backgroundColor: theme.palette.common.white
        }
    })
);

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
    const classes = useStyles({ imageSize });

    if (size === "tiny") {
        return (
            <img src={url}
                 key={"tiny_image_preview_" + url}
                 className={classes.imageTiny}/>
        );
    }

    const imageStyle: CSSProperties =
        {
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "4px"
        };

    return (
        <div
            className={classes.imageWrap}
            key={"image_preview_" + url}
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}>

            <img src={url}
                 className={classes.image}
                 style={imageStyle}/>

            {onHover && (
                <>
                    <Tooltip title="Copy url to clipboard">
                        <div className={classes.copyIcon}>
                            <IconButton
                                size={"small"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(url);
                                }}>
                                <ContentPasteIcon htmlColor={"#666"} fontSize={"small"} />
                            </IconButton>
                        </div>
                    </Tooltip>
                    <Tooltip title="Open image in new tab">
                        <a
                            className={classes.previewIcon}
                            href={url}
                            rel="noopener noreferrer"
                            target="_blank">
                            <IconButton
                                size={"small"}
                                onClick={(e) => e.stopPropagation()}>
                                <OpenInNewIcon htmlColor={"#666"} fontSize={"small"} />
                            </IconButton>
                        </a>
                    </Tooltip>
                </>
            )}
        </div>

    );
}
