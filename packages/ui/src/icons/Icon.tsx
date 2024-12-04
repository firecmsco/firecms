"use client";

import * as React from "react";
import { cls } from "../util";
import "material-symbols/rounded.css";
import "./default.css";

export type IconColor = "inherit" | "primary" | "secondary" | "disabled" | "error" | "success" | "warning";
export type IconProps = {
    size?: "smallest" | "small" | "medium" | "large" | number,
    color?: IconColor,
    className?: string,
    onClick?: (e: React.SyntheticEvent) => void,
    style?: React.CSSProperties,
}

const colorClassesMapping: Record<IconColor, string> = {
    inherit: "",
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    secondary: "text-secondary",
    disabled: "text-text-disabled dark:text-text-disabled-dark",
    error: "text-red-500"
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps & { iconKey: string }>(
    ({
         iconKey,
         size = "medium",
         color,
         className,
         onClick,
         style
     }, ref) => {
        let sizeInPx: number;
        switch (size) {
            case "smallest":
                sizeInPx = 16;
                break;
            case "small":
                sizeInPx = 20;
                break;
            case "medium":
                sizeInPx = 24;
                break;
            case "large":
                sizeInPx = 28;
                break
            default:
                sizeInPx = typeof size === "number" ? size : 24;
        }

        return <span
            ref={ref} // Attach the ref to the span
            style={{
                fontSize: `${sizeInPx}px`,
                display: "block",
                ...style
            }}
            className={
                cls("material-symbols-rounded",
                    color ? colorClassesMapping[color] : "",
                    "select-none",
                    className)}
            onClick={onClick}>{iconKey}</span>
    });

Icon.displayName = "Icon";
