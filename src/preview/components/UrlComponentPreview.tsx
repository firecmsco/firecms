import React from "react";
import { CardMedia, Link, Theme } from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { MediaType } from "../../models";
import { PreviewComponentProps } from "../internal";
import { ImagePreview } from "./ImagePreview";
import { getThumbnailMeasure } from "../util";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme: Theme) =>
    ({
        flexCenter: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        smallMargin: {
            margin: theme.spacing(1)
        },
        arrayWrap: {
            display: "flex",
            flexWrap: "wrap"
        },
        array: {
            display: "flex",
            flexDirection: "column"
        },
        arrayItem: {
            margin: theme.spacing(0.5)
        },
        arrayItemBig: {
            margin: theme.spacing(1)
        },
        link: {
            display: "flex",
            wordBreak: "break-word",
            fontWeight: theme.typography.fontWeightMedium
        }
    })
);

/**
 * @category Preview components
 */
export function UrlComponentPreview({
                                        value,
                                        property,
                                        size
                                    }: PreviewComponentProps<string>): React.ReactElement {

    const classes = useStyles();

    if (!value) return <div/>;
    const url = value;
    if (typeof property.config?.url === "boolean" && property.config.url) {
        return (
            <Link className={classes.link}
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

    const mediaType: MediaType = property.config?.url as MediaType ||
        property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return <ImagePreview key={`image_preview_${url}_${size}`}
                             url={url}
                             size={size}/>;
    } else if (mediaType === "audio") {
        return <audio controls
                      src={url}
                      key={`audio_preview_${url}_${size}`}>
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
