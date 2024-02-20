import React from "react";

import {focusedMixin} from "../styles";
import {cn} from "../util";

export type ButtonProps<P extends React.ElementType> =
    Omit<(P extends "button" ? React.ButtonHTMLAttributes<HTMLButtonElement> : React.ComponentProps<P>), "onClick">
    & {
    variant?: "filled" | "outlined" | "text";
    disabled?: boolean;
    color?: "primary" | "secondary" | "text";
    size?: "small" | "medium" | "large";
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
        "h-fit rounded-md uppercase inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition ease-in-out duration-150 gap-2";

    // const buttonClasses = cn(
    //     {
    //         "w-full": fullWidth,
    //         "w-fit": !fullWidth,
    //         "border-transparent bg-primary hover:bg-primary-dark focus:ring-primary !text-white shadow hover:ring-1 hover:ring-primary": variant === "filled" && !disabled,
    //         "border-transparent !text-primary !hover:text-primary-dark hover:bg-primary hover:bg-primary-bg": variant === "text" && !disabled,
    //         "border-primary !text-primary hover:bg-primary-bg hover:border-primary-dark !hover:text-primary-dark focus:ring-primary hover:ring-1 hover:ring-primary": variant === "outlined" && !disabled,
    //         "border-primary-dark border-opacity-50 dark:border-primary dark:border-opacity-50 opacity-50 !text-primary-dark !dark:text-primary text-opacity-50 dark:text-opacity-50": variant === "outlined" && disabled,
    //         "border-transparent outline-none opacity-50 !text-slate-600 !dark:text-slate-500": (variant === "filled" || variant === "text") && disabled
    //     }
    // );

    const buttonClasses = cn({
        "w-full": fullWidth,
        "w-fit": !fullWidth,
        // Filled Variants
        "border border-transparent bg-primary hover:bg-primary-dark focus:ring-primary shadow hover:ring-1 hover:ring-primary text-white": variant === "filled" && color === "primary" && !disabled,
        "border border-transparent bg-secondary hover:bg-secondary-dark focus:ring-secondary shadow hover:ring-1 hover:ring-secondary text-white": variant === "filled" && color === "secondary" && !disabled,
        "border border-transparent bg-slate-200 hover:bg-slate-300 focus:ring-slate-400 shadow hover:ring-1 hover:ring-slate-400 text-text-primary dark:text-text-primary-dark": variant === "filled" && color === "text" && !disabled,
        // Text Variants
        "text-primary hover:bg-slate-200 dark:hover:bg-gray-900": variant === "text" && color === "primary" && !disabled,
        "text-secondary hover:bg-secondary-bg": variant === "text" && color === "secondary" && !disabled,
        "text-text-primary dark:text-text-primary-dark hover:bg-slate-200 hover:dark:bg-gray-700": variant === "text" && color === "text" && !disabled,
        // Outlined Variants
        "border border-primary text-primary hover:bg-primary-bg": variant === "outlined" && color === "primary" && !disabled,
        "border border-secondary text-secondary hover:bg-secondary-bg": variant === "outlined" && color === "secondary" && !disabled,
        "border border-slate-400 text-text-primary dark:text-text-primary-dark hover:bg-slate-200": variant === "outlined" && color === "text" && !disabled,
        // Disabled states for all variants
        "opacity-50": disabled
    });

    const sizeClasses = cn(
        {
            "py-1 px-2": size === "small",
            "py-2 px-4": size === "medium",
            "py-2.5 px-5": size === "large"
        }
    );

    if (Component) {
        return (
            <Component
                ref={ref}
                onClick={props.onClick}
                className={cn(focusedMixin, startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
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
                className={cn(focusedMixin, startIcon ? "pl-3" : "", baseClasses, buttonClasses, sizeClasses, className)}
                disabled={disabled}
                {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>
            {startIcon}
            {children}
        </button>
    );

});

ButtonInner.displayName = "Button"

export const Button = ButtonInner as React.FC<ButtonProps<any>>;
