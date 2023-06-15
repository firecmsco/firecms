import React, { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "regular" | "ghost";
}

export const TIconButton: React.FC<IconButtonProps> = ({
                                                   variant = "regular",
                                                   children,
                                                   ...props
                                               }) => {
    const buttonClasses =
        variant === "regular"
            ? "bg-blue-500 hover:bg-blue-600 text-white focus:ring-4 focus:ring-blue-400"
            : "bg-transparent hover:bg-gray-200 text-gray-600 focus:ring-4 focus:ring-gray-400";
    const baseClasses =
        "inline-flex items-center justify-center p-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ease-in-out duration-150";

    return (
        <button {...props} className={`${baseClasses} ${buttonClasses}`}>
            {children}
        </button>
    );
};
