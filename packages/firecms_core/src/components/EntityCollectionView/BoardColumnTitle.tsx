import { ChipColorKey, ChipColorScheme, getColorSchemeForKey, cls } from "@firecms/ui";
import React, { useMemo } from "react";

export interface BoardColumnTitleProps {
    children: React.ReactNode;
    className?: string;
    "aria-label"?: string;
    color?: ChipColorKey | ChipColorScheme;
}

export function BoardColumnTitle({
    children,
    className,
    color,
    ...props
}: BoardColumnTitleProps) {
    const colorScheme = useMemo(() => {
        if (!color) return undefined;
        if (typeof color === "string") {
            return getColorSchemeForKey(color);
        }
        return color;
    }, [color]);

    return (
        <h4
            className={
                cls("py-3 px-3 transition-colors duration-200 flex-grow select-none relative outline-none focus:outline focus:outline-2 focus:outline-offset-2 flex items-center gap-3",
                    "text-sm font-semibold text-surface-800 dark:text-surface-200",
                    className)
            }
            {...props}
        >
            {colorScheme && (
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                        backgroundColor: colorScheme.color
                    }}
                />
            )}
            {children}
        </h4>
    );
}
