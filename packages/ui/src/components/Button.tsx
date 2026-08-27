"use client";
import React from "react";
import { cls } from "../util";

export type ButtonProps<C extends React.ElementType = "button"> = {
    children?: React.ReactNode;
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    color?: "primary" | "secondary" | "text" | "error" | "neutral";
    size?: "small" | "medium" | "large" | "xl" | "2xl";
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
    component?: C;
    onClick?: React.MouseEventHandler<any>;
} & React.ComponentPropsWithoutRef<C>;

const ButtonInner = React.memo(React.forwardRef<
    HTMLButtonElement,
    ButtonProps<React.ElementType>
>(({
       children,
       className,
       variant = "filled",
       disabled = false,
       size = "medium",
       startIcon = null,
       fullWidth = false,
       component: Component,
       color = "neutral",
       loading,
       ...props
   }: ButtonProps<any>, ref) => {

    const baseClasses =
        "typography-button h-fit rounded-lg whitespace-nowrap inline-flex items-center justify-center p-2 px-4 focus:outline-none transition-colors ease-in-out duration-150 gap-2";

    const buttonClasses = cls({
        "w-full": fullWidth,
        "w-fit": !fullWidth,

        // Filled Variants
        "border border-primary bg-primary focus:ring-primary text-white hover:text-white hover:brightness-105": variant === "filled" && color === "primary" && !disabled,
        "border border-secondary bg-secondary focus:ring-secondary text-white hover:text-white hover:brightness-105": variant === "filled" && color === "secondary" && !disabled,
        "border border-red-500 bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white hover:text-white": variant === "filled" && color === "error" && !disabled,
        "border border-surface-accent-200 bg-surface-accent-200 hover:bg-surface-accent-300 focus:ring-surface-accent-400 text-text-primary hover:text-text-primary dark:border-surface-accent-700 dark:bg-surface-accent-700 dark:hover:bg-surface-accent-600 dark:text-text-primary-dark hover:dark:text-text-primary-dark": variant === "filled" && color === "text" && !disabled,
        "border border-transparent bg-surface-100 hover:bg-surface-accent-200 text-text-primary dark:bg-surface-700 dark:hover:bg-surface-accent-700 dark:text-text-primary-dark hover:text-text-primary dark:text-text-primary-dark hover:dark:text-text-primary-dark": variant === "filled" && color === "neutral" && !disabled,

        // Text Variants
        "border border-transparent text-primary hover:text-primary hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:hover:bg-surface-accent-800": variant === "text" && color === "primary" && !disabled,
        "border border-transparent text-secondary hover:text-secondary hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:hover:bg-surface-accent-800": variant === "text" && color === "secondary" && !disabled,
        "border border-transparent text-red-500 hover:text-red-500 hover:bg-red-500 hover:bg-opacity-10 hover:bg-red-500/10": variant === "text" && color === "error" && !disabled,
        "border border-transparent text-text-primary hover:text-text-primary dark:text-text-primary-dark hover:dark:text-text-primary-dark hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:hover:bg-surface-accent-800": variant === "text" && color === "text" && !disabled,
        "border border-transparent text-text-primary hover:text-text-primary hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:text-text-primary-dark dark:hover:text-text-primary-dark dark:hover:bg-surface-accent-800": variant === "text" && color === "neutral" && !disabled,

        // Outlined Variants
        "border border-primary text-primary hover:text-primary hover:bg-primary-bg hover:bg-primary/10": variant === "outlined" && color === "primary" && !disabled,
        "border border-secondary text-secondary hover:text-secondary hover:bg-secondary-bg": variant === "outlined" && color === "secondary" && !disabled,
        "border border-red-500 text-red-500 hover:text-red-500 hover:bg-red-500 hover:text-white": variant === "outlined" && color === "error" && !disabled,
        "border border-surface-accent-400 text-text-primary hover:text-text-primary dark:text-text-primary-dark dark:border-surface-accent-600 hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:hover:bg-surface-accent-800": variant === "outlined" && color === "text" && !disabled,
        "border border-surface-300 text-text-primary hover:bg-surface-accent-200 hover:bg-opacity-75 hover:bg-surface-accent-200/75 dark:border-surface-600 dark:text-text-primary-dark dark:hover:bg-surface-accent-800": variant === "outlined" && color === "neutral" && !disabled,

        // Disabled states for all variants.
        // A disabled button still has to be readable: it is often disabled
        // precisely because the user has to do something first, and they can
        // only decide to do it if they can read the label. So "inactive" is
        // carried by a flat muted surface and the cursor, never by fading the
        // label toward the background. The previous rules stacked a low-alpha
        // text colour, a low-alpha background and `opacity-40/50`, which landed
        // the login buttons at 3.6:1.
        "cursor-not-allowed text-surface-600 dark:text-surface-400": disabled,
        "border border-transparent": variant === "text" && disabled,
        "border border-surface-300 dark:border-surface-600": variant === "outlined" && disabled,
        "border border-transparent bg-surface-accent-100 dark:bg-surface-800": variant === "filled" && disabled,
    });

    const iconColorClass = (color === "neutral" || color === "text") && !disabled
        ? "[&>svg]:text-surface-accent-500 dark:[&>svg]:text-surface-accent-300"
        : "";

    const sizeClasses = cls(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2.5 px-5": size === "large",
            "py-3 px-6": size === "xl",
            "py-4 px-10": size === "2xl"
        }
    );

    if (Component) {
        return (
            <Component
                ref={ref}
                onClick={props.onClick}
                className={cls(startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, iconColorClass, className)}
                {...props}>
                {startIcon}
                {children}
            </Component>
        );
    }

    return (
        <button ref={ref as any}
                type={props.type ?? "button"}
                onClick={props.onClick}
                className={cls(startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, iconColorClass, className)}
                disabled={disabled}
                data-variant={variant}
                data-size={size}
                {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>
            {startIcon}
            {children}
        </button>
    );

}));

ButtonInner.displayName = "Button"

export const Button = ButtonInner as React.FC<ButtonProps<any>>;
