import React from "react";
import { cn } from "./util/cn";

export type BooleanSwitchProps = {
    value: boolean | null;
    className?: string;
    disabled?: boolean;
    size?: "small" | "medium";
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
            className={cn(
                size === "small" ? "w-[38px] h-[22px] min-w-[38px] min-h-[22px]" : "w-[42px] h-[26px] min-w-[42px] min-h-[26px]",
                "outline-none rounded-full relative shadow-sm",
                value ? (disabled
                    ? "bg-white bg-opacity-54 dark:bg-gray-950"
                    : "ring-secondary ring-1 bg-secondary dark:bg-secondary") : "bg-white bg-opacity-54 dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-700",
                className
            )}
            {...props}
        >
            {allowIndeterminate && (value === null || value === undefined) && <div
                className={cn(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-gray-400 dark:bg-gray-600" : "bg-gray-600 dark:bg-gray-400",
                    {
                        "w-[21px] h-[10px]": size === "medium",
                        "w-[19px] h-[8px]": size === "small",
                        "translate-x-[10px]": size === "medium",
                        "translate-x-[9px]": size === "small"
                    }
                )}
            />}

            {!(allowIndeterminate && (value === null || value === undefined)) && <div
                className={cn(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-gray-300 dark:bg-gray-700" : (value ? "bg-white" : "bg-gray-600 dark:bg-gray-400"),
                    {
                        "w-[21px] h-[21px]": size === "medium",
                        "w-[19px] h-[19px]": size === "small",
                        [value ? "translate-x-[19px]" : "translate-x-[3px]"]: size === "medium",
                        [value ? "translate-x-[17px]" : "translate-x-[2px]"]: size === "small"
                    }
                )}
            />}
        </button>;
    }
) as React.ForwardRefExoticComponent<BooleanSwitchProps & React.RefAttributes<HTMLButtonElement>>;
