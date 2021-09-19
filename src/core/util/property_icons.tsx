import { Property } from "../../models";
import ShortTextIcon from "@mui/icons-material/ShortText";
import SubjectIcon from "@mui/icons-material/Subject";
import AttachmentIcon from "@mui/icons-material/Attachment";
import Crop75Icon from "@mui/icons-material/Crop75";
import ListIcon from "@mui/icons-material/List";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ListAltIcon from "@mui/icons-material/ListAlt";
import React from "react";
import RoomIcon from "@mui/icons-material/Room";
import ViewListIcon from "@mui/icons-material/ViewList";
import LinkIcon from "@mui/icons-material/Link";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import PhotoIcon from "@mui/icons-material/Photo";
import HttpIcon from "@mui/icons-material/Http";
import FlagIcon from "@mui/icons-material/Flag";
import AdjustIcon from "@mui/icons-material/Adjust";

export function getIdIcon(
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    return <AdjustIcon color={color} fontSize={fontSize}/>;
}

export function getIconForProperty(
    property: Property,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    if (property.dataType === "string") {
        if (property.config?.multiline || property.config?.markdown) {
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
        if (property.properties)
            return <ViewListIcon color={color} fontSize={fontSize}/>;
        else
            return <ListAltIcon color={color} fontSize={fontSize}/>;
    } else if (property.dataType === "array") {
        if (property.of)
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
