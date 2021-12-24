import { ArrayProperty, Property, PropertyOrBuilder } from "../../models";
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
import FunctionsIcon from '@mui/icons-material/Functions';

export function getIdIcon(
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    return <AdjustIcon color={color} fontSize={fontSize}/>;
}

export function getIconForProperty(
    property: PropertyOrBuilder,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    if (typeof property === "function") {
        return <FunctionsIcon color={color} fontSize={fontSize}/>;
    }
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

export function getWidgetNameForProperty(    property: Property): string {
    if (property.dataType === "string") {
        if (property.config?.multiline ) {
            return "Multiline text";
        } else  if (property.config?.markdown ) {
            return "Markdown text";
        } else if (property.config?.storageMeta) {
            if (property.config.storageMeta.mediaType === "image")
                return "Image upload";
            return "File upload";
        } else if (property.config?.url) {
            return "Url";
        } else if (property.config?.enumValues) {
            return "Single select";
        } else {
            return "Text";
        }
    } else if (property.dataType === "number") {
        return "Number";
    } else if (property.dataType === "geopoint") {
        return "Geopoint";
    } else if (property.dataType === "map") {
        if (property.properties)
            return "Group";
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        if (of) {
            if ((of.dataType === "string" || of.dataType === "number") && of.config?.enumValues) {
                return "Multi select";
            } else if (of.dataType === "string" && of.config?.storageMeta) {
                return "Multi file upload";
            } else if (of.dataType === "reference") {
                return "Multiple references";
            } else {
                return "Repeat/list";
            }
        }
    } else if (property.dataType === "boolean") {
        return "Switch";
    } else if (property.dataType === "timestamp") {
        return "Date/time";
    } else if (property.dataType === "reference") {
        return "Reference";
    }
    throw Error("Unsupported widget mapping");
}
