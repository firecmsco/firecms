import React from "react";

import { focusedMixin } from "../styles";
import { cn } from "../util";

export type ButtonProps<P extends React.ElementType> =
    Omit<(P extends "button" ? React.ButtonHTMLAttributes<HTMLButtonElement> : React.ComponentProps<P>), "onClick">
    & {
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
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
                                                        fullWidth = false,
                                                        component: Component,
                                                        ...props
                                                    }: ButtonProps<P>) {

    const baseClasses =
        "h-fit rounded-md border uppercase inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition ease-in-out duration-150 gap-2";

    const buttonClasses = cn(
        {
            "w-full": fullWidth,
            "w-fit": !fullWidth,
            "border-transparent bg-primary hover:bg-primary-dark focus:ring-primary !text-white shadow hover:ring-1 hover:ring-primary": variant === "filled" && !disabled,
            "border-transparent !text-primary !hover:text-primary-dark hover:bg-primary hover:bg-primary-bg": variant === "text" && !disabled,
            "border-primary !text-primary hover:bg-primary-bg hover:border-primary-dark !hover:text-primary-dark focus:ring-primary hover:ring-1 hover:ring-primary": variant === "outlined" && !disabled,
            "border-primary-dark border-opacity-50 dark:border-blue-500 dark:border-opacity-50 opacity-50 !text-primary-dark !dark:text-blue-500 text-opacity-50 dark:text-opacity-50": variant === "outlined" && disabled,
            "border-transparent outline-none opacity-50 !text-slate-600 !dark:text-slate-500": (variant === "filled" || variant === "text") && disabled
        }
    );

    const sizeClasses = cn(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2.5 px-5": size === "large"
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
