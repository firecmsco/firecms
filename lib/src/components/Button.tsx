import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

import { focusedMixin } from "../styles";

export type ButtonProps<C extends React.ElementType> = {
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    startIcon?: React.ReactNode;
    className?: string;
    component?: C;
} & React.ComponentPropsWithoutRef<C>;

export function Button<C extends React.ElementType = "button">({
                              children,
                              className,
                              variant = "filled",
                              disabled = false,
                              size = "medium",
                              startIcon = null,
                              ...props
                          }: ButtonProps<C>) {
    const baseClasses =
        "rounded-md border font-headers uppercase inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition ease-in-out duration-150";

    const buttonClasses = clsx(
        {
            "border-transparent bg-primary hover:bg-blue-600 focus:ring-blue-400 text-white shadow hover:ring-1 hover:ring-primary": variant === "filled" && !disabled,
            "border-primary text-primary hover:bg-primary hover:bg-opacity-10 hover:border-blue-600 hover:text-blue-600 focus:ring-blue-400 hover:ring-1 hover:ring-primary": variant === "outlined" && !disabled,
            "border-transparent text-primary hover:text-blue-600 hover:bg-primary hover:bg-opacity-10": variant === "text" && !disabled,
            "border-gray-600 dark:border-gray-500 opacity-50 text-gray-600 dark:text-gray-500": variant === "outlined" && disabled,
            "border-transparent outline-none opacity-50 text-gray-600 dark:text-gray-500":  (variant === "filled" || variant === "text") && disabled,
        }
    );

    const sizeClasses = clsx(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2 px-5": size === "large"
        }
    );

    return (<button
            type="button"
            {...props}
            className={clsx(focusedMixin,
                baseClasses,
                buttonClasses,
                sizeClasses,
                className)}
            disabled={disabled}
        >
            {startIcon && <span className="mr-2">{startIcon}</span>}
            {children}
        </button>
    );
};
