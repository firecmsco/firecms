"use client";
import React, { useState } from "react";
import { cls } from "../util";

export interface AvatarProps {
    src?: string;
    alt?: string;
    children?: React.ReactNode;
    className?: string;
    outerClassName?: string;
    hover?: boolean;
    style?: React.CSSProperties;
}

const AvatarInner: React.ForwardRefRenderFunction<HTMLButtonElement, AvatarProps> = (
    {
        src,
        alt,
        children,
        className,
        style,
        outerClassName,
        hover = true,
        ...props
    },
    ref
) => {
    const [isImageError, setIsImageError] = useState(false);

    const handleImageError = () => {
        setIsImageError(true);
    };

    return (
        <button
            ref={ref}
            style={style}
            {...props}
            className={cls(
                "rounded-full flex items-center justify-center overflow-hidden",
                "p-1 w-12 h-12 min-w-12 min-h-12",
                hover && "hover:bg-surface-accent-200 hover:dark:bg-surface-accent-700",
                outerClassName
            )}
        >
            {src && !isImageError ? (
                <img
                    className={cls(
                        "bg-surface-accent-100 dark:bg-surface-accent-800",
                        "w-full h-full object-cover rounded-full",
                        className
                    )}
                    src={src}
                    alt={alt}
                    onError={handleImageError}
                />
            ) : (
                <span
                    className={cls(
                        "bg-surface-accent-100 dark:bg-surface-accent-800",
                        "flex items-center justify-center",
                        "w-full h-full py-1.5 text-lg font-medium text-surface-accent-900 dark:text-white rounded-full",
                        className
                    )}
                >
          {children}
        </span>
            )}
        </button>
    );
};

export const Avatar = React.forwardRef(AvatarInner);
