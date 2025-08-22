import React, { useMemo } from "react";

import { ImagePreview } from "./ImagePreview";
import { getThumbnailMeasure } from "../util";
import { PreviewSize, PreviewType } from "@firecms/types";
import { cls, DescriptionIcon, OpenInNewIcon, Tooltip, Typography } from "@firecms/ui";
import { EmptyValue } from "./EmptyValue";

/**
 * @group Preview components
 */
export function UrlComponentPreview({
                                        url,
                                        previewType,
                                        size,
                                        hint,
                                        interactive = true
                                    }: {
    url: string,
    previewType?: PreviewType,
    size: PreviewSize,
    hint?: string,
    // for video controls
    interactive?: boolean
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
                      className={"max-w-100%"}
                      src={url}>
            Your browser does not support the
            <code>audio</code> element.
        </audio>;
    } else if (previewType === "video") {
        return <VideoPreview size={size} src={url} interactive={interactive}/>;
    } else {
        return (
            <Tooltip title={hint}>
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
                    <DescriptionIcon className="text-surface-700 dark:text-surface-300"/>
                    {hint && <Typography
                        className="max-w-full truncate rtl text-left"
                        variant={"caption"}>{hint}</Typography>}
                </a>
            </Tooltip>
        );
    }
}

function VideoPreview({
                          size,
                          src,
                          interactive
                      }: { size: PreviewSize, src: string, interactive: boolean }) {

    const imageSize = useMemo(() => {
        if (size === "small")
            return "140px";
        else if (size === "medium")
            return "240px";
        else if (size === "large")
            return "100%";
        else throw new Error("Invalid size");
    }, [size]);

    const videoProps = {
        controls: interactive
    };
    return <video
        style={{
            position: "relative",
            objectFit: "cover",
            width: imageSize,
            minWidth: "140px",
            // height: imageSize,
            maxHeight: "100%"
        }}
        {...videoProps}
        className={cls("max-w-100% rounded-xs", { "pointer-events-none": !interactive })}>
        <source src={src}/>
    </video>;
}
