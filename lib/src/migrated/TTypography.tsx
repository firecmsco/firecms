import React, { forwardRef } from "react";
import clsx from "clsx";

export interface TypographyProps {
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
    body1: "p",
    body2: "p",
    inherit: "p",
    caption: "p"
};

const colorToClasses = {
    inherit: "text-inherit",
    initial: "text-current",
    primary: "text-primary",
    secondary: "text-secondary",
    error: "text-red-600"
};

const variantToClasses = {
    h1: "text-6xl",
    h2: "text-5xl",
    h3: "text-4xl",
    h4: "text-3xl",
    h5: "text-2xl",
    h6: "text-xl",
    subtitle1: "text-lg",
    subtitle2: "text-base",
    body1: "text-base",
    body2: "text-sm",
    inherit: "text-base",
    caption: "tex-xs"
};

const TTypography = forwardRef<HTMLSpanElement, TypographyProps>(function Typography(
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
        color
    },
    ref
) {
    const Component =
        component ||
        (paragraph ? "p" : variantMapping[variant] || defaultVariantMapping[variant]) ||
        "span";

    const classes = clsx(
        variantToClasses[variant],
        color ? colorToClasses[color] : "",
        align !== "inherit" && `text-${align}`,
        gutterBottom && "mb-[0.35em]",
        noWrap && "truncate",
        paragraph && "mb-4",
        className
    );

    return (
        <Component ref={ref} className={classes}>
            {children}
        </Component>
    );
});

export default TTypography;
