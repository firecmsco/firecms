import React, { ForwardRefRenderFunction } from "react";
import { cls } from "../util";

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

const ContainerInner: ForwardRefRenderFunction<HTMLDivElement, ContainerProps> = (
    {
        children,
        className,
        style,
        maxWidth = "7xl",
    },
    ref
) => {

    const classForMaxWidth = maxWidth ? containerMaxWidths[maxWidth] : "";

    return (
        <div
            ref={ref}
            className={cls("mx-auto px-3 md:px-4 lg-px-6",
                classForMaxWidth,
                className)}
            style={style}>
            {children}
        </div>
    );
}

export const Container = React.forwardRef(ContainerInner);

