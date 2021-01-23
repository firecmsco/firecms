import { PreviewComponentProps } from "../../models/preview_component_props";
import React from "react";
import { MediaType } from "../../models";
import ImagePreview from "./ImagePreview";


import { CardMedia, Link } from "@material-ui/core";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { useStyles } from "./styles";
import { getThumbnailMeasure } from "../util";

export function UrlComponentPreview({
                                        name,
                                        value,
                                        property,
                                        size,
                                        entitySchema
                                    }: PreviewComponentProps<string>): React.ReactElement {

    const classes = useStyles();

    if (!value) return <div/>;
    const url = value;
    if (typeof property.config?.url === "boolean" && property.config.url) {
        return <Link style={{
            display: "flex",
            wordBreak: "break-word",
            fontWeight: 500
        }}
                     href={url}
                     onClick={(e: React.MouseEvent) => e.stopPropagation()}
                     target="_blank">
            <OpenInNewIcon style={{ marginRight: 8 }} fontSize={"small"}/>
            {url}
        </Link>;
    }

    const mediaType: MediaType = property.config?.url as MediaType
        || property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return <ImagePreview key={`image_preview_${url}_${size}`} url={url}
                             size={size}/>;
    } else if (mediaType === "audio") {
        return <audio controls src={url} key={`audio_preview_${url}_${size}`}>
            Your browser does not support the
            <code>audio</code> element.
        </audio>;
    } else if (mediaType === "video") {
        return <CardMedia
            key={`video_preview_${url}_${size}`}
            style={{ maxWidth: size === "small" ? 300 : 500 }}
            component="video"
            controls
            image={url}
        />;
    } else {
        return <a
            key={`link_preview_${url}_${size}`}
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={(e) => e.stopPropagation()}>
            <div className={classes.flexCenter}
                 style={{
                     width: getThumbnailMeasure(size),
                     height: getThumbnailMeasure(size)
                 }}>
                <DescriptionOutlinedIcon/>
            </div>
        </a>;
    }
}
