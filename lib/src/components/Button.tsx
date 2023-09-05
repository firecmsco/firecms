import React from "react";

import { focusedMixin } from "../styles";
import { cn } from "./util/cn";

export type ButtonProps<P extends React.ElementType> =
    Omit<(P extends "button" ? React.ButtonHTMLAttributes<HTMLButtonElement> : React.ComponentProps<P>), "onClick">
    & {
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    startIcon?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<any>
};

export function Button<P extends React.ElementType>({
                                                        children,
                                                        className,
                                                        variant = "filled",
                                                        disabled = false,
                                                        size = "medium",
                                                        startIcon = null,
                                                        component: Component,
                                                        ...props
                                                    }: ButtonProps<P>) {

    const baseClasses =
        "rounded-md border font-headers uppercase inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition ease-in-out duration-150 gap-2";

    const buttonClasses = cn(
        {
            "border-transparent bg-primary hover:bg-blue-600 focus:ring-blue-400 !text-white shadow hover:ring-1 hover:ring-primary": variant === "filled" && !disabled,
            "border-primary !text-primary hover:bg-primary hover:bg-opacity-10 hover:border-blue-600 !hover:text-blue-600 focus:ring-blue-400 hover:ring-1 hover:ring-primary": variant === "outlined" && !disabled,
            "border-transparent !text-primary !hover:text-blue-600 hover:bg-primary hover:bg-opacity-10": variant === "text" && !disabled,
            "border-gray-600 dark:border-gray-500 opacity-50 t!ext-gray-600 !dark:text-gray-500": variant === "outlined" && disabled,
            "border-transparent outline-none opacity-50 !text-gray-600 !dark:text-gray-500": (variant === "filled" || variant === "text") && disabled
        }
    );

    const sizeClasses = cn(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2 px-5": size === "large"
        }
    );

    if (Component) {
        return (
            <Component onClick={props.onClick}
                       className={cn(focusedMixin, startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
                       {...(props as React.ComponentPropsWithRef<P>)}>
                {startIcon}
                {children}
            </Component>
        );
    }

    return (
        <button type={props.type ?? "button"}
                onClick={props.onClick}
                className={cn(focusedMixin, startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
                disabled={disabled}
                {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>
            {startIcon}
            {children}
        </button>
    );
}
