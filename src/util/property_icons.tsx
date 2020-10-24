import { Property } from "../models";
import ShortTextIcon from "@material-ui/icons/ShortText";
import SubjectIcon from "@material-ui/icons/Subject";
import AttachmentIcon from "@material-ui/icons/Attachment";
import Crop75Icon from "@material-ui/icons/Crop75";
import ListIcon from "@material-ui/icons/List";
import ScheduleIcon from "@material-ui/icons/Schedule";
import ListAltIcon from "@material-ui/icons/ListAlt";
import React from "react";
import RoomIcon from "@material-ui/icons/Room";
import ViewListIcon from "@material-ui/icons/ViewList";
import LinkIcon from "@material-ui/icons/Link";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import PhotoIcon from "@material-ui/icons/Photo";
import HttpIcon from "@material-ui/icons/Http";
import FlagIcon from "@material-ui/icons/Flag";
import AdjustIcon from "@material-ui/icons/Adjust";

export function getIdIcon(
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "default" | "small" | "large" = "default"): React.ReactNode {
    return <AdjustIcon color={color} fontSize={fontSize}/>;
}

export function getIconForProperty(
    property: Property,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "default" | "small" | "large" = "default"): React.ReactNode {
    if (property.dataType === "string") {
        if (property.config?.multiline) {
            return <SubjectIcon color={color} fontSize={fontSize}/>;
        } else if (property.config?.storageMeta) {
            if (property.config.storageMeta.mediaType === "image")
                return <PhotoIcon color={color} fontSize={fontSize}/>;
            return <AttachmentIcon color={color} fontSize={fontSize}/>;
        } else if (property.config?.url) {
            return <HttpIcon color={color} fontSize={fontSize}/>;
        } else if (property.config?.enumValues) {
            return <ListIcon color={color} fontSize={fontSize}/>;
        } else {
            return <ShortTextIcon color={color} fontSize={fontSize}/>;
        }
    } else if (property.dataType === "number") {
        return <EqualizerIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "geopoint") {
        return <RoomIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "map") {
        return <ViewListIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "array") {
        if ("dataType" in property.of)
            return getIconForProperty(property.of, color, fontSize);
        else
            return <ListAltIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "boolean") {
        return <FlagIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "timestamp") {
        return <ScheduleIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "reference") {
        return <LinkIcon color={color} fontSize={fontSize}/>;
    } else {
        return <Crop75Icon color={color} fontSize={fontSize}/>;
    }
}
