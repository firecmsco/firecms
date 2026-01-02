"use client";
import React from "react";
import { cls } from "../util";

export type BooleanSwitchProps = {
    value: boolean | null;
    className?: string;
    disabled?: boolean;
    size?: "smallest" | "small" | "medium" | "large";
} & ({
    allowIndeterminate: true;
    onValueChange?: (newValue: boolean | null) => void;
} | {
    allowIndeterminate?: false;
    onValueChange?: (newValue: boolean) => void;
});

export const BooleanSwitch = React.forwardRef(function BooleanSwitch({
                                                                         value,
                                                                         allowIndeterminate,
                                                                         className,
                                                                         onValueChange,
                                                                         disabled = false,
                                                                         size = "medium",
                                                                         ...props
                                                                     }: BooleanSwitchProps, ref: React.Ref<HTMLButtonElement>) {
        return <button
            type="button"
            ref={ref}
            tabIndex={disabled ? -1 : undefined}
            onClick={disabled
                ? (e) => e.preventDefault()
                : (e) => {
                    e.preventDefault();
                    if (allowIndeterminate) {
                        if (value === null || value === undefined) onValueChange?.(true)
                        else if (value) onValueChange?.(false)
                        else onValueChange?.(null);
                    } else {
                        onValueChange?.(!value);
                    }
                }}
            className={cls(
                size === "smallest" ? "w-[34px] h-[18px] min-w-[34px] min-h-[18px]" : size === "small" ? "w-[38px] h-[22px] min-w-[38px] min-h-[22px]" : "w-[44px] h-[26px] min-w-[44px] min-h-[26px]",
                "outline-none rounded-full relative shadow-sm",
                value ? (disabled
                    ? "bg-white bg-opacity-54 dark:bg-surface-accent-950 border-surface-accent-100 dark:border-surface-accent-700 ring-1 ring-surface-accent-200 dark:ring-surface-accent-700"
                    : "ring-secondary ring-1 bg-secondary dark:bg-secondary") : "bg-white bg-opacity-54 dark:bg-surface-accent-900 ring-1 ring-surface-accent-200 dark:ring-surface-accent-700",
                className
            )}
            {...props}
        >
            {allowIndeterminate && (value === null || value === undefined) && <div
                key={"knob"}
                className={cls(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-surface-accent-400 dark:bg-surface-accent-600" : "bg-surface-accent-400 dark:bg-surface-accent-600",
                    {
                        "w-[21px] h-[10px]": size === "medium" || size === "large",
                        "w-[19px] h-[8px]": size === "small",
                        "w-[16px] h-[6px]": size === "smallest",
                        "translate-x-[10px]": size === "medium" || size === "large",
                        "translate-x-[9px]": size === "small",
                        "translate-x-[8px]": size === "smallest"
                    }
                )}
            />}

            {!(allowIndeterminate && (value === null || value === undefined)) && <div
                key={"knob"}
                className={cls(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-surface-accent-300 dark:bg-surface-accent-700" : (value ? "bg-white" : "bg-surface-accent-600 dark:bg-surface-accent-400"),
                    {
                        "w-[21px] h-[21px]": size === "medium" || size === "large",
                        "w-[19px] h-[19px]": size === "small",
                        "w-[16px] h-[16px]": size === "smallest",
                        [value ? "translate-x-[19px]" : "translate-x-[3px]"]: size === "medium" || size === "large",
                        [value ? "translate-x-[17px]" : "translate-x-[2px]"]: size === "small",
                        [value ? "translate-x-[16px]" : "translate-x-[1px]"]: size === "smallest"
                    }
                )}
            />}
        </button>;
    }
) as React.ForwardRefExoticComponent<BooleanSwitchProps & React.RefAttributes<HTMLButtonElement>>;
