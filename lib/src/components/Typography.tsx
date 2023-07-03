import React, { forwardRef, ReactEventHandler } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export interface TextProps {
    align?: "center" | "inherit" | "justify" | "left" | "right";
    children?: React.ReactNode;
    className?: string;
    component?: React.ElementType;
    gutterBottom?: boolean;
    noWrap?: boolean;
    paragraph?: boolean;
    variant?: keyof typeof defaultVariantMapping;
    variantMapping?: { [key: string]: string };
    color?: "inherit" | "initial" | "primary" | "secondary" | "error";
    onClick?: ReactEventHandler<HTMLElement>;
    style?: React.CSSProperties;
}

const defaultVariantMapping = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    subtitle1: "h6",
    subtitle2: "h6",
    label: "label",
    body1: "p",
    body2: "p",
    inherit: "p",
    caption: "p"
};

const colorToClasses = {
    inherit: "text-inherit",
    initial: "text-current",
    primary: "text-primary",
    secondary: "text-text-secondary dark:text-text-secondary-dark",
    error: "text-red-600"
};

const variantToClasses = {
    h1: "text-6xl font-headers font-light",
    h2: "text-5xl font-headers font-light",
    h3: "text-4xl font-headers font-normal",
    h4: "text-3xl font-headers font-normal",
    h5: "text-2xl font-headers font-normal",
    h6: "text-xl font-headers font-medium",
    subtitle1: "text-lg font-headers font-normal",
    subtitle2: "text-base font-headers font-medium",
    body1: "text-base",
    body2: "text-sm",
    label: "text-sm font-medium text-gray-500",
    inherit: "text-inherit",
    caption: "text-xs"
};

export const Typography = forwardRef<HTMLSpanElement, TextProps>(function Typography(
    {
        align = "inherit",
        children,
        className,
        component,
        gutterBottom = false,
        noWrap = false,
        paragraph = false,
        variant = "body1",
        variantMapping = defaultVariantMapping,
        color,
        style,
        onClick
    },
    ref
) {
    const Component =
        component ||
        (paragraph ? "p" : variantMapping[variant] || defaultVariantMapping[variant]) ||
        "span";

    const classes = clsx(
        focusedMixin,
        variantToClasses[variant],
        color ? colorToClasses[color] : "",
        align !== "inherit" && `text-${align}`,
        gutterBottom && "mb-[0.35em]",
        noWrap && "truncate",
        paragraph && "mb-4",
        className
    );

    return (
        <Component ref={ref} className={classes} onClick={onClick}
                   style={style}>
            {children}
        </Component>
    );
});
