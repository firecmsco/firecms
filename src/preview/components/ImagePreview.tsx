import React, { CSSProperties, useMemo, useState } from "react";
import clsx from "clsx";
import { IconButton } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { PreviewSize } from "../../models/preview_component_props";
import { useStyles } from "./styles";
import { getThumbnailMeasure } from "../util";

type ImagePreviewProps = { size: PreviewSize, url: string };

function ImagePreview({ size, url }: ImagePreviewProps) {


    const classes = useStyles();

    const [onHover, setOnHover] = useState(false);

    const imageSize = useMemo(() => getThumbnailMeasure(size), [size]);

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
        <div
            className={clsx(classes.flexCenter, classes.imageWrap)}
            key={"image_preview_" + url}
            style={{
                width: imageSize,
                height: imageSize
            }}
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}>

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
        </div>

    );
}

export default ImagePreview;
