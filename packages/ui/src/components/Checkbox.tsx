import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { CheckIcon, RemoveIcon } from "../icons";
import { cls } from "../util";

export interface CheckboxProps {
    checked: boolean;
    id?: string;
    disabled?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    padding?: boolean;
    size?: "smallest" | "small" | "medium" | "large";
    color?: "primary" | "secondary";
}

const sizeClasses = {
    large: "w-6 h-6 rounded flex items-center justify-center",
    medium: "w-5 h-5 rounded flex items-center justify-center",
    small: "w-4 h-4 rounded flex items-center justify-center",
    smallest: "w-4 h-4 rounded flex items-center justify-center"
};

const outerSizeClasses = {
    medium: "w-10 h-10",
    small: "w-8 h-8",
    large: "w-12 h-12 ",
    smallest: "w-6 h-6"
}
const paddingClasses = {
    medium: "p-2",
    small: "p-2",
    large: "p-2",
    smallest: ""
}

const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary"
}

export const Checkbox = ({
                             id,
                             checked,
                             indeterminate = false,
                             padding = true,
                             disabled,
                             size = "medium",
                             onCheckedChange,
                             color = "primary"
                         }: CheckboxProps) => {

    const isChecked = indeterminate ? false : checked;

    const iconSize = size === "medium"
        ? 20
        : size === "small"
            ? 16
            : size === "smallest"
                ? 14
                : 24;
    return (
        <CheckboxPrimitive.Root
            id={id}
            checked={indeterminate || isChecked}
            disabled={disabled}
            onCheckedChange={disabled ? undefined : onCheckedChange}>

            <div className={cls(
                padding ? paddingClasses[size] : "",
                outerSizeClasses[size],
                "inline-flex items-center justify-center text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150",
                onCheckedChange ? "rounded-full hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:hover:bg-surface-accent-700 dark:hover:bg-opacity-75 dark:hover:bg-surface-accent-700/75" : "",
                onCheckedChange ? "cursor-pointer" : "cursor-default"
            )}>
                <div
                    className={cls(
                        "border-2 relative transition-colors ease-in-out duration-150",
                        sizeClasses[size],
                        disabled
                            ? (indeterminate || isChecked ? "bg-surface-accent-400 dark:bg-surface-accent-600" : "bg-surface-accent-400 dark:bg-surface-accent-600")
                            : (indeterminate || isChecked ? colorClasses[color] : "bg-white dark:bg-surface-900"),
                        (indeterminate || isChecked) ? "text-surface-accent-100 dark:text-surface-accent-900" : "",
                        disabled
                            ? "border-transparent"
                            : (indeterminate || isChecked ? "border-transparent" : "border-surface-accent-800 dark:border-surface-accent-200")
                    )}>
                    <CheckboxPrimitive.Indicator asChild>
                        {indeterminate
                            ? (
                                <RemoveIcon size={iconSize} className={"absolute"}/>
                            )
                            : (
                                <CheckIcon size={iconSize} className={"absolute"}/>
                            )}
                    </CheckboxPrimitive.Indicator>
                </div>
            </div>
        </CheckboxPrimitive.Root>
    );
};
