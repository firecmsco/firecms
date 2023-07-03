import React from "react";
import { CardMedia, Link } from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ImagePreview } from "./ImagePreview";
import { getThumbnailMeasure } from "../util";
import { PreviewType } from "../../types";
import { PreviewSize } from "../PropertyPreviewProps";
import { Typography } from "../../components/Typography";
import { Tooltip } from "../../components/Tooltip";

/**
 * @category Preview components
 */
export function UrlComponentPreview({
                                        url,
                                        previewType,
                                        size,
                                        hint
                                    }: {
    url: string,
    previewType?: PreviewType,
    size: PreviewSize,
    hint?: string
}): React.ReactElement {

    if (!previewType) {
        return (
            <Link className="flex break-words items-center font-medium"
                  href={url}
                  onMouseDown={(e: React.MouseEvent) => {
                      e.preventDefault();
                  }}
                  target="_blank">
                <OpenInNewIcon style={{ marginRight: 8 }} fontSize={"small"}/>
                {url}
            </Link>
        );
    }

    if (previewType === "image") {
        return <ImagePreview url={url}
                             size={size}/>;
    } else if (previewType === "audio") {
        return <audio controls
                      src={url}>
            Your browser does not support the
            <code>audio</code> element.
        </audio>;
    } else if (previewType === "video") {
        return <CardMedia
            className={`max-w-${size === "small" ? "sm" : "md"}`}
            component="video"
            controls
            image={url}
        />;
    } else {
        return (
            <a
                href={url}
                rel="noopener noreferrer"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center justify-center"
                style={{
                    width: getThumbnailMeasure(size),
                    height: getThumbnailMeasure(size)
                }}>
                <DescriptionOutlinedIcon className="flex-grow"/>
                {hint &&
                    <Tooltip title={hint}>
                        <Typography
                            className="max-w-full truncate rtl text-left"
                            variant={"caption"}>{hint}</Typography>
                    </Tooltip>}
            </a>
        );
    }
}
