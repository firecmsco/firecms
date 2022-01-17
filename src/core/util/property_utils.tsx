import React from "react";
import AdjustIcon from "@mui/icons-material/Adjust";
import FunctionsIcon from '@mui/icons-material/Functions';
import Crop75Icon from "@mui/icons-material/Crop75";

import { Property, PropertyOrBuilder } from "../../models";
import { getWidget } from "./widgets";

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
    } else {
        const widget = getWidget(property);
        const Icon = widget?.icon ?? Crop75Icon;
        return <Icon color={color} fontSize={fontSize}/>;
    }
}

export function getColorForProperty(property: PropertyOrBuilder): string {
    if (typeof property === "function") {
        return "#666";
    } else {
        const widget = getWidget(property);
        return widget?.color ?? "#666";
    }
}

export function getWidgetNameForProperty(property: Property): string | undefined {
    const widget = getWidget(property);
    return widget?.name;
}
