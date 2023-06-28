import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type IconButtonProps<P> = ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "medium" | "small" | "large";
    variant?: "ghost" | "filled",
    component?: React.ElementType<P>;
} & P

const buttonClasses =
    "rounded-full  hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75";
const baseClasses =
    "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150";
const colorClasses = "dark:text-gray-100 text-gray-700";
const sizeClasses = {
    medium: "w-10 h-10",
    small: "w-8 h-8",
    large: "w-12 h-12"
}

export function IconButton<P>({
                                  children,
                                  className,
                                  size = "medium",
                                  variant = "ghost",
                                  component,
                                  ...props
                              }: IconButtonProps<P>) {

    const bgClasses = variant === "ghost" ? "bg-transparent" : "bg-gray-50 dark:bg-gray-950";
    const Component: React.ElementType<any> = component || "button";
    return (
        <Component {...props}
                   onClick={props.onClick
                       ? (e: React.MouseEvent<any>) => {
                           if (!component)
                               e.preventDefault();
                           props?.onClick?.(e);
                       }
                       : undefined}
                   className={clsx(
                       focusedMixin,
                       colorClasses,
                       bgClasses,
                       baseClasses,
                       buttonClasses,
                       className,
                       sizeClasses[size]
                   )}>
            {children}
        </Component>
    );
};
