import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type IconButtonProps<C extends React.ElementType> = ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "medium" | "small" | "large";
    variant?: "ghost" | "filled",
    shape?: "circular" | "square",
    component?: C;
} & Record<string, any>;

const buttonClasses =
    "hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75";
const baseClasses =
    "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150";
const colorClasses = "dark:text-gray-100 text-gray-700";
const sizeClasses = {
    medium: "!w-10 !h-10 min-w-10 min-h-10",
    small: "!w-8 !h-8 min-w-8 min-h-8",
    large: "!w-12 !h-12 min-w-12 min-h-12"
}
const shapeClasses = {
    circular: "rounded-full",
    square: "rounded-md"
}

export function IconButton<C extends React.ElementType>({
                                                            children,
                                                            className,
                                                            size = "medium",
                                                            variant = "ghost",
                                                            shape = "circular",
                                                            component,
                                                            ...props
                                                        }: IconButtonProps<C>) {

    const bgClasses = variant === "ghost" ? "bg-transparent" : "bg-gray-50 dark:bg-gray-950";
    const Component: React.ElementType<any> = component || "button";
    return (
        <Component
            type="button"
            {...props}
            className={clsx(
                focusedMixin,
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
