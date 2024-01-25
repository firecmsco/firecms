import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { EvShadowMinusIcon, Icon } from "../icons";
import { cn } from "../util";

interface CheckboxProps {
    checked: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    size?: "small" | "medium" | "large";
    color?: "primary" | "secondary";
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

const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary"
}

export const Checkbox = ({
                             checked,
                             indeterminate = false,
                             disabled,
                             size = "medium",
                             onCheckedChange,
                             color = "primary"
                         }: CheckboxProps) => {

    const isChecked = indeterminate ? false : checked;

    return (
        <div className={cn(
            outerSizeClasses[size],
            "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150",
            onCheckedChange ? "rounded-full hover:bg-slate-200 hover:bg-opacity-75 dark:hover:bg-slate-700 dark:hover:bg-opacity-75" : "",
            onCheckedChange ? "cursor-pointer" : "cursor-default"
        )}>
            <CheckboxPrimitive.Root
                asChild
                checked={indeterminate || isChecked}
                disabled={disabled}
                onCheckedChange={disabled ? undefined : onCheckedChange}>
                <div
                    className={cn(
                        "border-2 relative transition-colors ease-in-out duration-150",
                        sizeClasses[size],
                        disabled
                            ? (indeterminate || isChecked ? "bg-slate-400 dark:bg-slate-600" : "bg-slate-400 dark:bg-slate-600")
                            : (indeterminate || isChecked ? colorClasses[color] : "bg-white dark:bg-slate-900"),
                        isChecked ? "text-slate-100 dark:text-slate-900" : "",
                        disabled
                            ? "border-transparent"
                            : (indeterminate || isChecked ? "border-transparent" : "border-slate-800 dark:border-slate-200")
                    )}>
                    <CheckboxPrimitive.Indicator asChild>
                        {indeterminate
                            ? (
                                <Icon iconKey={"remove"} size={20} className={"absolute"}/>
                            )
                            : (
                                <Icon iconKey={"check"} size={20} className={"absolute"}/>
                            )}
                    </CheckboxPrimitive.Indicator>
                </div>
            </CheckboxPrimitive.Root>
            {/*{indeterminate && (*/}
            {/*    <div >*/}
            {/*         YO*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};
