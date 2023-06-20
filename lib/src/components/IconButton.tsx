import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type IconButtonProps<P> = ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "medium" | "small" | "large";
    component?: React.ElementType<P>;
} & P

export function IconButton<P>({
                                  children,
                                  className,
                                  size = "medium",
                                  component,
                                  ...props
                              }: IconButtonProps<P>) {
    const buttonClasses =
        "rounded-full bg-transparent hover:bg-gray-200 hover:bg-opacity-75 dark:hover:bg-gray-700 dark:hover:bg-opacity-75 text-gray-800 dark:text-gray-200";
    const baseClasses =
        "inline-flex items-center justify-center p-2 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150";
    const sizeClasses = {
        medium: "w-10 h-10",
        small: "w-8 h-8",
        large: "w-12 h-12"
    }

    const Component:React.ElementType<any> = component || "button";
    return (
        <Component {...props}
                   className={clsx(
                       focusedMixin,
                       baseClasses,
                       buttonClasses,
                       className,
                       sizeClasses[size]
                   )}>
            {children}
        </Component>
    );
};
