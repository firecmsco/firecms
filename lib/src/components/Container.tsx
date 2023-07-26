import React from "react";

export type ContainerProps = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Container({
                              children,
                              className,
                              style,
                              maxWidth
                          }: ContainerProps) {

    const classForMaxWidth = maxWidth ? `max-w-${maxWidth}` : "";

    const combinedClasses = `container mx-auto px-4 ${classForMaxWidth} ${className}`;

    return (
        <div
            className={combinedClasses}
            style={style}>
            {children}
        </div>
    );
}
