import React from "react";
import ShortTextIcon from "@mui/icons-material/ShortText";
import SubjectIcon from "@mui/icons-material/Subject";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ListIcon from "@mui/icons-material/List";
import ScheduleIcon from "@mui/icons-material/Schedule";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import RepeatIcon from "@mui/icons-material/Repeat";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LinkIcon from "@mui/icons-material/Link";
import HttpIcon from "@mui/icons-material/Http";
import FlagIcon from "@mui/icons-material/Flag";
import NumbersIcon from "@mui/icons-material/Numbers";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EmailIcon from "@mui/icons-material/Email";
import BallotOutlinedIcon from "@mui/icons-material/BallotOutlined";

import {
    ArrayProperty,
    DataType,
    Property,
    ResolvedProperty
} from "../../models";
import { SvgIconProps } from "@mui/material";

export type Widget = {
    name: string;
    dataType: DataType;
    icon: React.ComponentType<SvgIconProps>;
    color: string;
}

export type WidgetId =
    "text_field" |
    "multiline" |
    "markdown" |
    "url" |
    "email" |
    "select" |
    "multi_select" |
    "number_input" |
    "number_select" |
    "multi_number_select" |
    "file_upload" |
    "multi_file_upload" |
    "group" |
    "reference" |
    "multi_references" |
    "switch" |
    "date_time" |
    "repeat";

export const WIDGETS: Record<WidgetId, Widget> = {
    text_field: {
        name: "Text field",
        dataType: "string",
        icon: ShortTextIcon,
        color: "#2d7ff9",
    },
    multiline: {
        name: "Multiline",
        dataType: "string",
        icon: SubjectIcon,
        color: "#2d7ff9"
    },
    markdown: {
        name: "Markdown",
        dataType: "string",
        icon: FormatQuoteIcon,
        color: "#2d7ff9"
    },
    url: {
        name: "Url",
        dataType: "string",
        icon: HttpIcon,
        color: "#154fb3"
    },
    email: {
        name: "Email",
        dataType: "string",
        icon: EmailIcon,
        color: "#154fb3"
    },
    select: {
        name: "Select",
        dataType: "string",
        icon: ListIcon,
        color: "#4223c9"
    },
    multi_select: {
        name: "Multi select",
        dataType: "array",
        icon: ListAltIcon,
        color: "#4223c9"
    },
    number_input: {
        name: "Number input",
        dataType: "number",
        icon: NumbersIcon,
        color: "#bec920"
    },
    number_select: {
        name: "Number select",
        dataType: "number",
        icon: FormatListNumberedIcon,
        color: "#bec920"
    },
    multi_number_select: {
        name: "Multiple number select",
        dataType: "number",
        icon: FormatListNumberedIcon,
        color: "#bec920"
    },
    file_upload: {
        name: "File upload",
        dataType: "string",
        icon: UploadFileIcon,
        color: "#f92d9a"
    },
    multi_file_upload: {
        name: "Multiple file upload",
        dataType: "array",
        icon: DriveFolderUploadIcon,
        color: "#f92d9a"
    },
    reference: {
        name: "Reference/s",
        dataType: "reference",
        icon: LinkIcon,
        color: "#ff0042"
    },
    multi_references: {
        name: "Multiple references",
        dataType: "array",
        icon: AddLinkIcon,
        color: "#ff0042"
    },
    switch: {
        name: "Switch",
        dataType: "boolean",
        icon: FlagIcon,
        color: "#20d9d2"
    },
    date_time: {
        name: "Date/time",
        dataType: "date",
        icon: ScheduleIcon,
        color: "#8b46ff"
    },
    group: {
        name: "Group",
        dataType: "map",
        icon: BallotOutlinedIcon,
        color: "#ff9408"
    },
    repeat: {
        name: "Repeat/list",
        dataType: "array",
        icon: RepeatIcon,
        color: "#ff9408"
    }
};

export function getWidget(property: Property | ResolvedProperty): Widget | undefined {
    const widgetId = getWidgetId(property);
    return widgetId ? WIDGETS[widgetId] : undefined;
}

export function getWidgetId(property: Property | ResolvedProperty): WidgetId | undefined {
    if (property.dataType === "string") {
        if (property.multiline) {
            return "multiline";
        } else if (property.markdown) {
            return "markdown";
        } else if (property.storage) {
            return "file_upload";
        } else if (property.url) {
            return "url";
        } else if (property.email) {
            return "email";
        } else if (property.enumValues) {
            return "select";
        } else {
            return "text_field";
        }
    } else if (property.dataType === "number") {
        if (property.enumValues) {
            return "number_select";
        }
        return "number_input";
    } else if (property.dataType === "map") {
        if (property.properties)
            return "group";
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        if (of?.dataType === "string" && of.enumValues) {
            return "multi_select";
        } else if (of?.dataType === "number" && of.enumValues) {
            return "multi_number_select";
        } else if (of?.dataType === "string" && of.storage) {
            return "multi_file_upload";
        } else if (of?.dataType === "reference") {
            return "multi_references";
        } else {
            return "repeat";
        }
    } else if (property.dataType === "boolean") {
        return "switch";
    } else if (property.dataType === "date") {
        return "date_time";
    } else if (property.dataType === "reference") {
        return "reference";
    }

    console.error("Unsupported widget mapping", property);
    return undefined;
}
