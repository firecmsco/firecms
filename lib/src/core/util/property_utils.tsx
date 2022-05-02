import React from "react";
import AdjustIcon from "@mui/icons-material/Adjust";
import FunctionsIcon from "@mui/icons-material/Functions";
import Crop75Icon from "@mui/icons-material/Crop75";

import { PropertyOrBuilder, ResolvedProperty } from "../../models";
import { getWidget, Widget } from "../widgets";
import { Box } from "@mui/material";
import { isPropertyBuilder } from "./entities";

export function getIdIcon(
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {
    return <AdjustIcon color={color} fontSize={fontSize}/>;
}

function getIconForWidget(widget: Widget | undefined,
                          color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error",
                          fontSize: "inherit" | "medium" | "large" | "small" | undefined) {
    const Icon = widget?.icon ?? Crop75Icon;
    return <Icon color={color} fontSize={fontSize}/>;
}

export function getIconForProperty(
    property: PropertyOrBuilder | ResolvedProperty,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit",
    fontSize: "inherit" | "medium" | "large" | "small" | undefined = "inherit"): React.ReactNode {

    if (isPropertyBuilder(property)) {
        return <FunctionsIcon color={color} fontSize={fontSize}/>;
    } else {
        const widget = getWidget(property);
        return getIconForWidget(widget, color, fontSize);
    }
}

export function getBadgeForWidget(
    widget: Widget | undefined,
    color: "inherit" | "primary" | "secondary" | "action" | "disabled" | "error" = "inherit"): React.ReactNode {

    return <Box sx={{
        background: widget?.color ?? "#888",
        height: "32px",
        width: "32px",
        padding: 0.5,
        borderRadius: "50%",
        boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        color: "white"
    }}>
        {getIconForWidget(widget, color, "medium")}
    </Box>
}

export function getColorForProperty(property: PropertyOrBuilder): string {
    if (isPropertyBuilder(property)) {
        return "#888";
    } else {
        const widget = getWidget(property);
        return widget?.color ?? "#666";
    }
}
