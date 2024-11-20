import React from "react";
import { CHIP_COLORS, cls, getColorSchemeForKey } from "../util";

export type ChipColorScheme = {
    color: string;
    text: string;
}

export type ChipColorKey = keyof typeof CHIP_COLORS;

export interface ChipProps {
    className?: string;
    children: React.ReactNode;
    size?: "small" | "medium" | "large";
    colorScheme?: ChipColorScheme | ChipColorKey;
    error?: boolean;
    outlined?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    style?: React.CSSProperties;
}

const sizeClassNames = {
    small: "px-2 py-0.5 text-sm",
    medium: "px-3 py-1 text-sm",
    large: "px-4 py-1.5 text-sm"
}

/**
 * @group Preview components
 */
export function Chip({
                         children,
                         colorScheme,
                         error,
                         outlined,
                         onClick,
                         icon,
                         size = "large",
                         className,
                         style
                     }: ChipProps) {

    const usedColorScheme = typeof colorScheme === "string" ? getColorSchemeForKey(colorScheme) : colorScheme;
    return (
        <div
            className={cls("rounded-lg max-w-full w-max h-fit font-regular inline-flex gap-1",
                "text-ellipsis",
                onClick ? "cursor-pointer hover:bg-surface-accent-300 hover:dark:bg-surface-accent-700" : "",
                sizeClassNames[size],
                error || !usedColorScheme ? "bg-surface-accent-200 dark:bg-surface-accent-800 text-surface-accent-800 dark:text-white" : "",
                error ? "text-red-500 dark:text-red-400" : "",
                className)}
            onClick={onClick}
            style={{
                backgroundColor: error || !usedColorScheme ? undefined : usedColorScheme.color,
                color: error || !usedColorScheme ? undefined : usedColorScheme.text,
                overflow: "hidden",
                ...style
                // display: "-webkit-box",
                // WebkitLineClamp: 1,
                // WebkitBoxOrient: "vertical",
            }}
        >
            {children}
            {icon}
        </div>
    );
}
