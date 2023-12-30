import React from "react";
import { focusedMixin } from "../styles";
import { cn } from "../util";

export type IconButtonProps<C extends React.ElementType> =
    Omit<(C extends "button" ? React.ButtonHTMLAttributes<HTMLButtonElement> : React.ComponentProps<C>), "onClick">
    & {
    size?: "medium" | "small" | "large";
    variant?: "ghost" | "filled",
    shape?: "circular" | "square",
    disabled?: boolean;
    toggled?: boolean;
    component?: C;
    onClick?: React.MouseEventHandler<any>
}

const buttonClasses =
    "hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75";
const baseClasses =
    "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150";
const colorClasses = "dark:text-gray-100 text-gray-700 visited:text-gray-700 dark:visited:text-gray-100";
const sizeClasses = {
    medium: "w-10 !h-10 min-w-10 min-h-10",
    small: "w-8 !h-8 min-w-8 min-h-8",
    large: "w-12 !h-12 min-w-12 min-h-12"
}
const shapeClasses = {
    circular: "rounded-full",
    square: "rounded-md"
}

const IconButtonInner = <C extends React.ElementType = "button">({
                                                                     children,
                                                                     className,
                                                                     size = "medium",
                                                                     variant = "ghost",
                                                                     shape = "circular",
                                                                     disabled,
                                                                     toggled,
                                                                     component,
                                                                     ...props
                                                                 }: IconButtonProps<C>, ref: React.ForwardedRef<HTMLButtonElement>) => {

    const bgClasses = variant === "ghost" ? "bg-transparent" : "bg-gray-50 dark:bg-gray-950";
    const Component: React.ElementType<any> = component || "button";
    return (
        <Component
            type="button"
            ref={ref}
            {...props}
            className={cn(
                focusedMixin,
                disabled ? "opacity-50 pointer-events-none" : "cursor-pointer",
                toggled ? "outline outline-2 outline-primary" : "",
                colorClasses,
                bgClasses,
                baseClasses,
                buttonClasses,
                shapeClasses[shape],
                sizeClasses[size],
                className
            )}>
            {children}
        </Component>
    );
};
// React.ForwardRefRenderFunction<HTMLButtonElement, IconButtonProps<C>>

export const IconButton = React.forwardRef(IconButtonInner as React.ForwardRefRenderFunction<HTMLButtonElement, IconButtonProps<any>>) as React.ComponentType<IconButtonProps<any>>;
