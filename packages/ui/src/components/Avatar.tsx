import React from "react";
import { cn } from "../util";
import { focusedMixin } from "../styles";

export interface AvatarProps {
    src?: string;
    alt?: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const AvatarInner: React.ForwardRefRenderFunction<HTMLButtonElement, AvatarProps> = (
    {
        src,
        alt,
        children,
        className,
        style,
        ...props
    }, ref) => {

    return (
        <button
            ref={ref}
            style={style}
            {...props}
            className={cn("rounded-full flex items-center justify-center overflow-hidden",
                focusedMixin,
                "p-1 hover:bg-gray-200 hover:dark:bg-gray-700 w-14 h-14",
            )}>
            {src
                ? (
                    <img className={cn(
                        "bg-gray-100 dark:bg-gray-800",
                        "w-full h-full object-cover rounded-full",
                        className)}
                         src={src}
                         alt={alt}/>
                )
                : (
                    <span
                        className={cn(
                            "bg-gray-100 dark:bg-gray-800",
                            "flex items-center justify-center",
                            "w-full h-full py-1.5 text-lg font-medium text-gray-900 dark:text-white rounded-full",
                            className)}>
                        {children}
                    </span>
                )}
        </button>
    );
};

export const Avatar = React.forwardRef(AvatarInner);
