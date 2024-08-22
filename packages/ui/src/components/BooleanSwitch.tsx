import React from "react";
import { cls } from "../util";

export type BooleanSwitchProps = {
    value: boolean | null;
    className?: string;
    disabled?: boolean;
    size?: "smallest" | "small" | "medium";
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
                                                                         size = "small",
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
                size === "smallest" ? "w-[38px] h-[22px] min-w-[38px] min-h-[22px]" : "w-[42px] h-[26px] min-w-[42px] min-h-[26px]",
                "outline-none rounded-full relative shadow-sm",
                value ? (disabled
                    ? "bg-white bg-opacity-54 dark:bg-slate-950 border-slate-100 dark:border-slate-700 ring-1 ring-slate-200 dark:ring-slate-700"
                    : "ring-secondary ring-1 bg-secondary dark:bg-secondary") : "bg-white bg-opacity-54 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700",
                className
            )}
            {...props}
        >
            {allowIndeterminate && (value === null || value === undefined) && <div
                key={"knob"}
                className={cls(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-slate-400 dark:bg-slate-600" : "bg-slate-400 dark:bg-slate-600",
                    {
                        "w-[21px] h-[10px]": size === "small" || size === "medium",
                        "w-[19px] h-[8px]": size === "smallest",
                        "translate-x-[10px]": size === "small" || size === "medium",
                        "translate-x-[9px]": size === "smallest"
                    }
                )}
            />}

            {!(allowIndeterminate && (value === null || value === undefined)) && <div
                key={"knob"}
                className={cls(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    disabled ? "bg-slate-300 dark:bg-slate-700" : (value ? "bg-white" : "bg-slate-600 dark:bg-slate-400"),
                    {
                        "w-[21px] h-[21px]": size === "small" || size === "medium",
                        "w-[19px] h-[19px]": size === "smallest",
                        [value ? "translate-x-[19px]" : "translate-x-[3px]"]: size === "small" || size === "medium",
                        [value ? "translate-x-[17px]" : "translate-x-[2px]"]: size === "smallest"
                    }
                )}
            />}
        </button>;
    }
) as React.ForwardRefExoticComponent<BooleanSwitchProps & React.RefAttributes<HTMLButtonElement>>;
