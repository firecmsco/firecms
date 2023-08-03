import React from "react";

export type ContainerProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}

const containerMaxWidths = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
}

export function Container({
                              children,
                              className,
                              style,
                              maxWidth
                          }: ContainerProps) {

    const classForMaxWidth = maxWidth ? containerMaxWidths[maxWidth] : "";

    const combinedClasses = `mx-auto px-3 md:px-4 lg-px-6 ${classForMaxWidth} ${className}`;

    return (
        <div
            className={combinedClasses}
            style={style}>
            {children}
        </div>
    );
}
