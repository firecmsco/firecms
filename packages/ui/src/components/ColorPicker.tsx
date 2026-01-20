import React from "react";
import { CHIP_COLORS, cls } from "../util";
import { ChipColorKey, ChipColorScheme } from "./Chip";
import { CheckIcon } from "../icons";
import { Tooltip } from "./Tooltip";

export interface ColorPickerProps {
    /**
     * Currently selected color key
     */
    value?: ChipColorKey;
    /**
     * Callback when color selection changes. Passes undefined when "Auto" is selected.
     */
    onChange: (colorKey: ChipColorKey | undefined) => void;
    /**
     * Size of the color swatches
     */
    size?: "small" | "medium";
    /**
     * Whether to show the "Auto" option that clears the selection
     */
    allowClear?: boolean;
    /**
     * Whether the picker is disabled
     */
    disabled?: boolean;
}

// Base colors in display order
const BASE_COLORS = ["blue", "cyan", "teal", "green", "yellow", "orange", "red", "pink", "purple", "gray"] as const;

// Variants in display order (darker to lighter for better visual flow)
const VARIANTS = ["Darker", "Dark", "Light", "Lighter"] as const;

// Helper to get readable name from color key
function getColorDisplayName(colorKey: ChipColorKey): string {
    // Convert camelCase to readable format: "blueLighter" -> "Blue Lighter"
    const base = colorKey.replace(/(Lighter|Light|Dark|Darker)$/, "");
    const variant = colorKey.replace(base, "");
    return `${base.charAt(0).toUpperCase()}${base.slice(1)} ${variant}`;
}

/**
 * A color picker component that displays a grid of predefined CHIP_COLORS.
 * Used for selecting colors for enum values, tags, and other chip-based UI elements.
 * 
 * @group Form components
 */
export function ColorPicker({
    value,
    onChange,
    size = "medium",
    allowClear = true,
    disabled = false
}: ColorPickerProps) {

    const swatchSize = size === "small" ? "w-5 h-5" : "w-6 h-6";
    const checkSize = size === "small" ? 12 : 14;

    return (
        <div className="flex flex-col gap-2">
            {allowClear && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(undefined)}
                    className={cls(
                        "flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors",
                        "hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800",
                        disabled && "opacity-50 cursor-not-allowed",
                        !value && "bg-surface-accent-100 dark:bg-surface-accent-800 font-medium"
                    )}
                >
                    <div className={cls(
                        swatchSize,
                        "rounded-full border-2 border-dashed border-surface-accent-400 dark:border-surface-accent-600",
                        "flex items-center justify-center"
                    )}>
                        {!value && <CheckIcon size={checkSize} />}
                    </div>
                    <span className="text-surface-accent-700 dark:text-surface-accent-300">
                        Auto (based on ID)
                    </span>
                </button>
            )}

            <div className="grid grid-cols-10 gap-1">
                {VARIANTS.map((variant) => (
                    BASE_COLORS.map((base) => {
                        const colorKey = `${base}${variant}` as ChipColorKey;
                        const colorScheme = CHIP_COLORS[colorKey] as ChipColorScheme;
                        const isSelected = value === colorKey;
                        const displayName = getColorDisplayName(colorKey);

                        return (
                            <Tooltip
                                key={colorKey}
                                title={displayName}
                                delayDuration={300}
                            >
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onChange(colorKey)}
                                    className={cls(
                                        swatchSize,
                                        "rounded-full transition-all flex items-center justify-center",
                                        "hover:scale-110 hover:shadow-md",
                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                                        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
                                        isSelected && "ring-2 ring-primary ring-offset-1"
                                    )}
                                    style={{
                                        backgroundColor: colorScheme.color,
                                    }}
                                    aria-label={displayName}
                                    aria-pressed={isSelected}
                                >
                                    {isSelected && (
                                        <CheckIcon
                                            size={checkSize}
                                            style={{ color: colorScheme.text }}
                                        />
                                    )}
                                </button>
                            </Tooltip>
                        );
                    })
                ))}
            </div>
        </div>
    );
}
