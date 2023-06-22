import React from "react";
import clsx from "clsx";

export interface BooleanSwitchProps {
    value: boolean;
    onValueChange?: (newValue: boolean) => void;
    disabled?: boolean;
    size?: "small" | "medium";
}

export const BooleanSwitch = React.forwardRef(function BooleanSwitch({
                                                                         value,
                                                                         onValueChange,
                                                                         disabled = false,
                                                                         size = "medium"
                                                                     }: BooleanSwitchProps, ref: React.Ref<HTMLButtonElement>) {
        return <button
            ref={ref}
            onClick={disabled
                ? undefined
                : (e) => {
                    e.preventDefault();
                    onValueChange?.(!value);
                }}
            className={clsx(
                size === "small" ? "w-[38px] h-[22px]" : "w-[42px] h-[26px]",
                "outline-none rounded-full relative shadow-sm",
                value ? "ring-secondary ring-1 bg-secondary dark:bg-secondary" : "bg-white bg-opacity-54 dark:bg-gray-900 ring-1 ring-gray-100 dark:ring-gray-700",
            )}>
            <div
                className={clsx(
                    "block rounded-full transition-transform duration-100 transform will-change-auto",
                    value ? "bg-white" : disabled ? "bg-gray-400 dark:bg-gray-600" : "bg-gray-600 dark:bg-gray-400",
                    {
                        "w-[21px] h-[21px]": size === "medium",
                        "w-[19px] h-[19px]": size === "small",
                        [value ? "translate-x-[19px]" : "translate-x-[3px]"]: size === "medium",
                        [value ? "translate-x-[17px]" : "translate-x-[2px]"]: size === "small"
                    }
                )}
            />
        </button>;
    }
) as React.ForwardRefExoticComponent<BooleanSwitchProps & React.RefAttributes<HTMLButtonElement>>;
