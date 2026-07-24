import React from "react";
import { cls } from "../util";

export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    /**
     * The text label displayed on the chip.
     */
    children: React.ReactNode;
    /**
     * Whether the chip is currently in an active/selected state.
     */
    active?: boolean;
    /**
     * Optional icon rendered before the label.
     */
    icon?: React.ReactNode;
    /**
     * Size variant.
     * @default "medium"
     */
    size?: "small" | "medium";
    /**
     * Whether the chip is disabled.
     */
    disabled?: boolean;
}

const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-xs"
};

/**
 * A toggle chip used for filter presets and similar multi-select controls.
 *
 * Uses an inset box-shadow for the active ring instead of `border` so the
 * chip size stays stable across states and the ring cannot be clipped by
 * parent `overflow-hidden` containers.
 *
 * @group Interactive components
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(function FilterChip({
    children,
    active = false,
    onClick,
    icon,
    size = "medium",
    className,
    disabled = false,
    ...rest
}: FilterChipProps, ref) {
    return (
        <button
            ref={ref}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cls(
                "inline-flex items-center gap-1 rounded-full",
                "font-medium whitespace-nowrap select-none shrink-0",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                sizeClasses[size],
                active
                    ? "bg-primary/12 text-primary dark:bg-primary/20 dark:text-primary shadow-[inset_0_0_0_1.5px_var(--color-primary)]"
                    : cls(
                        "bg-surface-accent-100 text-text-secondary dark:bg-surface-accent-800 dark:text-text-secondary-dark",
                        !disabled && "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/5"
                    ),
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            {...rest}
        >
            {icon}
            {children}
        </button>
    );
});
