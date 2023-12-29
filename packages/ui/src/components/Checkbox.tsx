import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { Icon } from "../icons";
import { cn } from "../utils";

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
        <div className={cn(
            outerSizeClasses[size],
            "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150",
            onCheckedChange ? "rounded-full hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75" : "",
            onCheckedChange ? "cursor-pointer" : "cursor-default"
        )}>
            <CheckboxPrimitive.Root
                asChild
                checked={isChecked}
                disabled={disabled}
                onCheckedChange={disabled ? undefined : onCheckedChange}>
                <div
                    className={cn(
                        "border-2 relative transition-colors ease-in-out duration-150",
                        sizeClasses[size],
                        disabled
                            ? (isChecked ? "bg-gray-400 dark:bg-gray-600" : "bg-gray-400 dark:bg-gray-600")
                            : (isChecked ? "bg-primary" : "bg-white dark:bg-gray-900"),
                        isChecked ? "text-gray-100 dark:text-gray-900" : "",
                        disabled
                            ? "border-transparent"
                            : (isChecked ? "border-transparent" : "border-gray-800 dark:border-gray-200")
                    )}>
                    <CheckboxPrimitive.Indicator asChild>
                        {indeterminate
                            ? (
                                <div className="w-full h-[1px] bg-currentColor"/>
                            )
                            : (
                                <Icon iconKey={"check"} size={20} className={"absolute"}/>
                            )}
                    </CheckboxPrimitive.Indicator>
                </div>
            </CheckboxPrimitive.Root>
        </div>
    );
};
