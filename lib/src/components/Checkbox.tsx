import React from "react";
import clsx from "clsx";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { Icon } from "../icons";

interface CheckboxProps {
    checked: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    size?: "small" | "medium" | "large";
}

const sizeClasses = {
    large: "w-6 h-6 rounded flex items-center justify-center",
    medium: "w-5 h-5 rounded flex items-center justify-center",
    small: "w-4 h-4 rounded flex items-center justify-center"
};

const outerSizeClasses = {
    medium: "w-10 h-10",
    small: "w-8 h-8",
    large: "w-12 h-12"
}

export const Checkbox = ({
                             checked,
                             indeterminate = false,
                             disabled,
                             size = "medium",
                             onCheckedChange
                         }: CheckboxProps) => {

    const isChecked = indeterminate ? false : checked;

    return (
        <div className={clsx(
            outerSizeClasses[size],
            "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150",
            onCheckedChange ? "rounded-full hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75" : "",
            onCheckedChange ? "cursor-pointer" : "cursor-default"
        )}>
            <CheckboxPrimitive.Root
                asChild
                checked={isChecked}
                disabled={disabled}
                onCheckedChange={onCheckedChange}>
                <div
                    className={clsx(
                        "border-2 relative transition-colors ease-in-out duration-150",
                        sizeClasses[size],
                        isChecked ? "bg-primary text-gray-100 dark:text-gray-900" : "bg-white dark:bg-gray-900",
                        isChecked ? "border-transparent" : "border-gray-700 dark:border-gray-100"
                    )}>
                    <CheckboxPrimitive.Indicator asChild>
                        {indeterminate
                            ? (
                                <div className="w-full h-[1px] bg-currentColor"/>
                            )
                            : (

                                <Icon iconKey={"check"} size={18} className={"absolute"}/>
                            )}
                    </CheckboxPrimitive.Indicator>
                </div>
            </CheckboxPrimitive.Root>
        </div>
    );
};
