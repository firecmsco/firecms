import React from "react";
import { cls } from "../util";

export type ToggleButtonOption<T extends string = string> = {
    value: T;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export type ToggleButtonGroupProps<T extends string = string> = {
    /**
     * Currently selected value
     */
    value: T;
    /**
     * Callback when value changes
     */
    onValueChange: (value: T) => void;
    /**
     * Options to display
     */
    options: ToggleButtonOption<T>[];
    /**
     * Additional class names for the container
     */
    className?: string;
}

/**
 * A toggle button group component for selecting one option from a set.
 * Displays options as buttons in a horizontal row with active state styling.
 */
export function ToggleButtonGroup<T extends string = string>({
    value,
    onValueChange,
    options,
    className
}: ToggleButtonGroupProps<T>) {
    return (
        <div className={cls("inline-flex flex-row bg-surface-100 dark:bg-surface-800 rounded-lg p-1 gap-1", className)}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!option.disabled) {
                            onValueChange(option.value);
                        }
                    }}
                    disabled={option.disabled}
                    className={cls(
                        "flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors",
                        value === option.value
                            ? "bg-white dark:bg-surface-950 text-primary dark:text-primary-300"
                            : "text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700",
                        option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                </button>
            ))}
        </div>
    );
}
