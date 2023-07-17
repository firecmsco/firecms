import React, { CSSProperties, useMemo, useState } from "react";

import { getThumbnailMeasure } from "../util";
import { PreviewSize } from "../PropertyPreviewProps";
import { IconButton } from "../../components";
import { Tooltip } from "../../components/Tooltip";
import { ContentCopyIcon } from "../../icons/ContentCopyIcon";
import { OpenInNewIcon } from "../../icons/OpenInNewIcon";

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

    if (size === "tiny") {
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
            maxHeight: "100%",
        };

    return (
        <div
            className="relative flex items-center justify-center max-w-full max-h-full"
            style={{
                width: imageSize,
                height: imageSize
            }}
            key={"image_preview_" + url}
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}>

            <img src={url}
                 className={"rounded-md"}
                 style={imageStyle}/>

            {onHover && <>

                {navigator && <Tooltip title="Copy url to clipboard">
                    <div
                        className="rounded-full absolute bottom-[-4px] right-8">
                        <IconButton
                            variant={"filled"}
                            size={"small"}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                return navigator.clipboard.writeText(url);
                            }}>
                            <ContentCopyIcon className={"text-gray-500"}
                                             size={"small"}/>
                        </IconButton>
                    </div>
                </Tooltip>}

                <Tooltip title="Open image in new tab">
                    <IconButton
                        variant={"filled"}
                        component={"a" as React.ElementType}
                        style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4
                        }}
                        href={url}
                        rel="noopener noreferrer"
                        target="_blank"
                        size={"small"}
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <OpenInNewIcon className={"text-gray-500"}
                                       size={"small"}/>
                    </IconButton>
                </Tooltip>
            </>
            }
        </div>
    );
}
