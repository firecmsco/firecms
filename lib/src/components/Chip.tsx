import { ChipColorScheme } from "../types";
import { getColorSchemeForSeed } from "../core/util/chip_utils";
import clsx from "clsx";

export interface ChipProps {
    className?: string;
    label: string;
    size?: "small" | "medium";
    colorScheme?: ChipColorScheme;
    error?: boolean;
    outlined?: boolean;
}

/**
 * @category Preview components
 */
export function Chip({
                         label,
                         colorScheme,
                         error,
                         outlined,
                         size,
                         className
                     }: ChipProps) {

    const usedColorScheme = colorScheme ?? getColorSchemeForSeed(label);
    return (
        <div
            className={clsx("rounded-full w-fit h-fit bg-gray-200 dark:bg-gray-800 font-normal",
                size === "small" ? "text-xs" : "text-sm",
                size === "small" ? "px-3 py-1" : "px-4 py-1",
                error || !usedColorScheme ? "bg-gray-200 dark:bg-gray-800 text-red-500" : "",
                className)}
            style={{
                backgroundColor: error || !usedColorScheme ? undefined : usedColorScheme.color,
                color: error || !usedColorScheme ? undefined : usedColorScheme.text
            }}
        >
            {label}
        </div>
    );
}
