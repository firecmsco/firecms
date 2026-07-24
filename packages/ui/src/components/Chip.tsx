import React from "react";
import { CHIP_COLORS, cls, getColorSchemeForKey } from "../util";

export type ChipColorScheme = {
    color: string;
    text: string;
    /** Background color override for dark mode. Falls back to `color`. */
    darkColor?: string;
    /** Text color override for dark mode. Falls back to `text`. */
    darkText?: string;
}

export type ChipColorKey = keyof typeof CHIP_COLORS;

export interface ChipProps {
    className?: string;
    children: React.ReactNode;
    size?: "smallest" | "small" | "medium" | "large";
    colorScheme?: ChipColorScheme | ChipColorKey;
    error?: boolean;
    outlined?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    style?: React.CSSProperties;
}

const sizeClassNames = {
    smallest: "px-1.5 py-px text-[10px]",
    small: "px-2 py-0.5 text-sm",
    medium: "px-3 py-1 text-sm",
    large: "px-4 py-1.5 text-sm"
}

/**
 * Detect if the app is currently in dark mode by checking the
 * Tailwind `dark` class on the document root.
 */
function isDarkMode(): boolean {
    return typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");
}

/**
 * Helper to generate rgba from a hex color. Returns the input unchanged for
 * non-hex values so it degrades gracefully.
 */
function getRgba(hex: string, alpha: number): string {
    if (!hex || !hex.startsWith("#")) return hex;
    let color = hex.slice(1);
    if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * @group Preview components
 */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(function Chip({
                         children,
                         colorScheme,
                         error,
                         outlined,
                         onClick,
                         icon,
                         size = "large",
                         className,
                         style
                     }: ChipProps, ref) {

    const usedColorScheme = typeof colorScheme === "string" ? getColorSchemeForKey(colorScheme) : colorScheme;
    const dark = isDarkMode();

    const hasScheme = Boolean(error || usedColorScheme);

    let textColor = "";
    let bgColor = "";
    let border = "";

    if (error) {
        textColor = dark ? "#f87171" : "#dc2626";
    } else if (usedColorScheme) {
        // Prefer a dark-mode override when present, otherwise fall back to the
        // existing scheme color so palettes without dark variants are unchanged.
        textColor = dark && usedColorScheme.darkText ? usedColorScheme.darkText : usedColorScheme.text;
    }

    if (hasScheme) {
        if (outlined) {
            bgColor = getRgba(textColor, dark ? 0.1 : 0.06);
            border = `1px solid ${getRgba(textColor, dark ? 0.2 : 0.14)}`;
        } else if (error) {
            bgColor = dark ? "rgba(220, 38, 38, 0.15)" : "rgba(239, 68, 68, 0.1)";
            border = `1px solid ${dark ? "rgba(220, 38, 38, 0.3)" : "rgba(239, 68, 68, 0.2)"}`;
        } else if (usedColorScheme) {
            bgColor = dark && usedColorScheme.darkColor ? usedColorScheme.darkColor : usedColorScheme.color;
        }
    }

    return (
        <div
            ref={ref}
            className={cls("rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1",
                "text-ellipsis",
                "items-center",
                "transition-colors duration-150",
                !hasScheme && "bg-surface-accent-200 dark:bg-surface-accent-800 text-surface-accent-800 dark:text-white",
                !hasScheme && outlined && "bg-transparent dark:bg-transparent border border-surface-accent-300 dark:border-surface-accent-700",
                onClick ? "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/5" : "",
                sizeClassNames[size],
                className)}
            onClick={onClick}
            style={{
                ...(hasScheme ? {
                    backgroundColor: bgColor,
                    color: textColor,
                    border: border || undefined
                } : {}),
                overflow: "hidden",
                ...style
            }}
        >
            {icon}
            {children}
        </div>
    );
});
