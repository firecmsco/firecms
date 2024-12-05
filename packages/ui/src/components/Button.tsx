"use client";
import React from "react";
import { cls } from "../util";

export type ButtonProps<P extends React.ElementType> =
    Omit<(P extends "button" ? React.ButtonHTMLAttributes<HTMLButtonElement> : React.ComponentProps<P>), "onClick">
    & {
    variant?: "filled" | "neutral" | "outlined" | "text";
    disabled?: boolean;
    color?: "primary" | "secondary" | "text" | "error";
    size?: "small" | "medium" | "large" | "xl" | "2xl";
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
    onClick?: React.MouseEventHandler<any>
};

const ButtonInner = React.forwardRef<
    ButtonProps<React.ElementType<any>>
>(({
       children,
       className,
       variant = "filled",
       disabled = false,
       size = "medium",
       startIcon = null,
       fullWidth = false,
       component: Component,
       color = "primary",
       ...props
   }: ButtonProps<any>, ref) => {

    const baseClasses =
        "typography-button h-fit rounded-md whitespace-nowrap inline-flex items-center justify-center p-2 px-4 focus:outline-none transition ease-in-out duration-150 gap-2";

    const buttonClasses = cls({
        "w-full": fullWidth,
        "w-fit": !fullWidth,

        // Filled Variants
        "border border-primary bg-primary hover:bg-primary-dark focus:ring-primary shadow hover:ring-1 hover:ring-primary text-white hover:text-white": variant === "filled" && color === "primary" && !disabled,
        "border border-secondary bg-secondary hover:bg-secondary-dark focus:ring-secondary shadow hover:ring-1 hover:ring-secondary text-white hover:text-white": variant === "filled" && color === "secondary" && !disabled,
        "border border-red-500 bg-red-500 hover:bg-red-500 focus:ring-red-500 shadow hover:ring-1 hover:ring-red-600 text-white hover:text-white": variant === "filled" && color === "error" && !disabled,
        "border border-surface-accent-200 bg-surface-accent-200 hover:bg-surface-accent-300 focus:ring-surface-accent-400 shadow hover:ring-1 hover:ring-surface-accent-400 text-text-primary hover:text-text-primary dark:text-text-primary-dark hover:dark:text-text-primary-dark": variant === "filled" && color === "text" && !disabled,

        // Text Variants
        "border border-transparent text-primary hover:text-primary hover:bg-surface-accent-200 dark:hover:bg-surface-900": variant === "text" && color === "primary" && !disabled,
        "border border-transparent text-secondary hover:text-secondary hover:bg-secondary-bg": variant === "text" && color === "secondary" && !disabled,
        "border border-transparent text-red-500 hover:text-red-500 hover:bg-red-500 hover:bg-opacity-10": variant === "text" && color === "error" && !disabled,
        "border border-transparent text-text-primary hover:text-text-primary dark:text-text-primary-dark hover:dark:text-text-primary-dark hover:bg-surface-accent-200 hover:dark:bg-surface-700": variant === "text" && color === "text" && !disabled,

        // Outlined Variants
        "border border-primary text-primary hover:text-primary hover:bg-primary-bg": variant === "outlined" && color === "primary" && !disabled,
        "border border-secondary text-secondary hover:text-secondary hover:bg-secondary-bg": variant === "outlined" && color === "secondary" && !disabled,
        "border border-red-500 text-red-500 hover:text-red-500 hover:bg-red-500 hover:text-white": variant === "outlined" && color === "error" && !disabled,
        "border border-surface-accent-400 text-text-primary hover:text-text-primary dark:text-text-primary-dark hover:bg-surface-accent-200": variant === "outlined" && color === "text" && !disabled,

        // Neutral Variants
        "border border-transparent bg-surface-100 hover:bg-surface-accent-200 text-text-primary dark:bg-surface-800 dark:hover:bg-surface-accent-700 dark:text-white": variant === "neutral" && (color === "primary" || color === "text") && !disabled,
        "border border-transparent bg-surface-100 hover:bg-surface-accent-200 text-text-secondary dark:bg-surface-800 dark:hover:bg-surface-accent-700 dark:text-white": variant === "neutral" && color === "secondary" && !disabled,
        "border border-transparent bg-surface-100 hover:bg-surface-accent-200 text-error dark:bg-surface-800 dark:hover:bg-surface-accent-700 dark:text-error": variant === "neutral" && color === "error" && !disabled,

        // Disabled states for all variants
        "text-text-disabled dark:text-text-disabled-dark": disabled,
        "border border-transparent opacity-50": variant === "text" && disabled,
        "border border-surface-500 opacity-50": variant === "outlined" && disabled,
        "border border-surface-500 bg-surface-500 opacity-50": (variant === "filled" || variant === "neutral") && disabled,
    });

    const sizeClasses = cls(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2.5 px-5": size === "large",
            "py-3 px-6": size === "xl",
            "py-4 px-10": size === "2xl",
        }
    );

    if (Component) {
        return (
            <Component
                ref={ref}
                onClick={props.onClick}
                className={cls(startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
                {...(props as React.ComponentPropsWithRef<any>)}>
                {startIcon}
                {children}
            </Component>
        );
    }

    return (
        <button ref={ref as any}
                type={props.type ?? "button"}
                onClick={props.onClick}
                className={cls(startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
                disabled={disabled}
                {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>
            {startIcon}
            {children}
        </button>
    );

});

ButtonInner.displayName = "Button"

export const Button = ButtonInner as React.FC<ButtonProps<any>>;
