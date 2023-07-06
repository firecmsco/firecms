import React, { ButtonHTMLAttributes, useCallback } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type ButtonProps<P> = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    startIcon?: React.ReactNode;
    className?: string;
    component?: React.ElementType<P>;
} & P;

export function Button<P>({
                              children,
                              className,
                              variant = "filled",
                              disabled = false,
                              size = "medium",
                              startIcon = null,
                              ...props
                          }: ButtonProps<P>) {
    const baseClasses =
        "rounded-md border font-headers uppercase inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition ease-in-out duration-150";

    const buttonClasses = clsx(
        {
            "border-transparent bg-primary hover:bg-blue-600 focus:ring-blue-400 text-white shadow hover:ring-1 hover:ring-primary": variant === "filled" && !disabled,
            "border-primary text-primary hover:bg-primary hover:bg-opacity-10 hover:border-blue-600 hover:text-blue-600 focus:ring-blue-400 hover:ring-1 hover:ring-primary": variant === "outlined" && !disabled,
            "border-transparent text-primary hover:text-blue-600 hover:bg-primary hover:bg-opacity-10": variant === "text" && !disabled,
            "border-transparent outline-none opacity-50 text-gray-600 dark:text-gray-500": disabled
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
