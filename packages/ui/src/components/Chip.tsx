import React from "react";
import { CHIP_COLORS, cn, getColorSchemeForKey } from "../util";

export type ChipColorScheme = {
    color: string;
    text: string;
}

export type ChipColorKey = keyof typeof CHIP_COLORS;

export interface ChipProps {
    className?: string;
    children: React.ReactNode;
    size?: "smaller" | "small" | "medium";
    colorScheme?: ChipColorScheme | ChipColorKey;
    error?: boolean;
    outlined?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}

const sizeClassNames = {
    smaller: "px-2 py-0.5 text-sm",
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-1.5 text-sm"
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
                         size = "medium",
                         className
                     }: ChipProps) {

    const usedColorScheme = typeof colorScheme === "string" ? getColorSchemeForKey(colorScheme) : colorScheme;
    return (
        <div
            className={cn("rounded-lg w-fit h-fit font-regular inline-flex items-center gap-1",
                "truncate",
                onClick ? "cursor-pointer hover:bg-gray-300 hover:dark:bg-gray-700" : "",
                sizeClassNames[size],
                error || !usedColorScheme ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" : "",
                error ? "text-red-500 dark:text-red-400" : "",
                className)}
            onClick={onClick}
            style={{
                backgroundColor: error || !usedColorScheme ? undefined : usedColorScheme.color,
                color: error || !usedColorScheme ? undefined : usedColorScheme.text
            }}
        >
            {children}
            {icon}
        </div>
    );
}
