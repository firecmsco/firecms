import React from "react";

import clsx from "clsx";
import { defaultBorderMixin } from "../styles";

export function LinedSpace({ position = "bottom", size = "small" }: {
    position?: "top" | "bottom",
    size?: "small" | "medium" | "large" | "larger" | "xlarge"
}) {

    const heightClass = size === "small" ? "h-8"
        : size === "medium" ? "h-16"
            : size === "large" ? "h-24"
                : size === "larger" ? "h-36"
                    : "h-56"

    return (
        <div className={clsx(heightClass,
            "w-full",
            "border-0",
            position === "top" ? "border-t" : "border-b",
            defaultBorderMixin)}/>
    )
}
