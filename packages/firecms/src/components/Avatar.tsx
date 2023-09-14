import React from "react";
import { cn } from "./util/cn";
import { focusedMixin } from "../styles";

interface AvatarProps {
    src?: string;
    alt?: string;
    children?: React.ReactNode;
    className?: string;
}

const AvatarInner: React.ForwardRefRenderFunction<HTMLButtonElement, AvatarProps> = (
    { src, alt, children, className, ...props }, ref) => {

    return (
        <button
            ref={ref}
            {...props}
            className={cn("rounded-full flex items-center justify-center overflow-hidden",
                focusedMixin,
                "p-1 hover:bg-gray-200 hover:dark:bg-gray-700",
                className
            )}>
            {src
                ? (
                    <img className="object-cover rounded-full w-10 h-10 bg-gray-100 dark:bg-gray-800" src={src}
                         alt={alt}/>
                )
                : (
                    <span
                        className="text-lg font-medium text-gray-900 dark:text-white rounded-full w-10 h-10 bg-gray-100 dark:bg-gray-800">{children}</span>
                )}
        </button>
    );
};

export const Avatar = React.forwardRef(AvatarInner);
