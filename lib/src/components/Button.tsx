import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  className,
                                                  ...props
                                              }) => {
    const buttonClasses = "rounded-md bg-primary hover:bg-blue-600 text-white focus:ring-blue-400";
    const baseClasses =
        "inline-flex items-center justify-center p-2 px-4 text-sm font-medium focus:outline-none transition-colors ease-in-out duration-150";

    return (
        <button {...props}
                className={clsx(focusedMixin,
                    baseClasses, buttonClasses, className)}>
            {children}
        </button>
    );
};
