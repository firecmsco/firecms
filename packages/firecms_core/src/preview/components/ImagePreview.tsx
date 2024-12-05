import React, { CSSProperties, useMemo } from "react";

import { getThumbnailMeasure } from "../util";
import { PreviewSize } from "../PropertyPreviewProps";
import { ContentCopyIcon, IconButton, OpenInNewIcon, Tooltip } from "@firecms/ui";

/**
 * @group Preview components
 */
export interface ImagePreviewProps {
    size: PreviewSize,
    url: string
}

/**
 * @group Preview components
 */
export function ImagePreview({
                                 size,
                                 url
                             }: ImagePreviewProps) {

    const imageSize = useMemo(() => getThumbnailMeasure(size), [size]);

    if (size === "small") {
        return (
            <img src={url}
                 className={"rounded-md"}
                 key={"tiny_image_preview_" + url}
                 style={{
                     position: "relative",
                     objectFit: "cover",
                     width: imageSize,
                     height: imageSize,
                     maxHeight: "100%"
                 }}/>
        );
    }

    const imageStyle: CSSProperties =
        {
            maxWidth: "100%",
            maxHeight: "100%"
        };

    return (
        <div
            className="relative flex items-center justify-center max-w-full max-h-full group"
            style={{
                width: imageSize,
                height: imageSize
            }}
            key={"image_preview_" + url}>

            <img src={url}
                 className={"rounded-md"}
                 style={imageStyle}/>

            <div className={"flex flex-row gap-2 absolute bottom-[-4px] right-[-4px] invisible group-hover:visible"}>
                {navigator && <Tooltip
                    asChild={true}
                    title="Copy url to clipboard" side={"bottom"}>
                    <IconButton
                        variant={"filled"}
                        size={"small"}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return navigator.clipboard.writeText(url);
                        }}>
                        <ContentCopyIcon className={"text-surface-700 dark:text-surface-300"}
                                         size={"smallest"}/>
                    </IconButton>
                </Tooltip>}

                <Tooltip title="Open image in new tab" side={"bottom"}>
                    <IconButton
                        className="invisible group-hover:visible"
                        variant={"filled"}
                        component={"a" as React.ElementType}
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank"
                        size={"small"}
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <OpenInNewIcon className={"text-surface-700 dark:text-surface-300"}
                                       size={"smallest"}/>
                    </IconButton>
                </Tooltip>
            </div>

        </div>
    );
}
