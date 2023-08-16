import React from "react";

import { ImagePreview } from "./ImagePreview";
import { getThumbnailMeasure } from "../util";
import { PreviewType } from "../../types";
import { PreviewSize } from "../PropertyPreviewProps";
import { Tooltip, Typography } from "../../components";
import { DescriptionIcon, OpenInNewIcon } from "../../icons";
import { EmptyValue } from "./EmptyValue";

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
        if (!url || !url.trim()) return <EmptyValue/>;
        return (
            <a className="flex gap-4 break-words items-center font-medium text-primary visited:text-primary dark:visited:text-primary dark:text-primary"
               href={url}
               rel="noopener noreferrer"
               onMouseDown={(e: React.MouseEvent) => {
                   e.preventDefault();
               }}
               target="_blank">
                <OpenInNewIcon size={"small"}/>
                {url}
            </a>
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
        return <video
            className={`max-w-${size === "small" ? "sm" : "md"}`}
            controls
        >
            <source src={url}/>
        </video>;
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
                <DescriptionIcon className="flex-grow"/>
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
