import React, { ReactEventHandler } from "react";
import clsx from "clsx";
import { focusedMixin } from "../styles";

export type TextProps<C extends React.ElementType> = {
    align?: "center" | "inherit" | "justify" | "left" | "right";
    children?: React.ReactNode;
    className?: string;
    component?: C;
    gutterBottom?: boolean;
    noWrap?: boolean;
    paragraph?: boolean;
    variant?: keyof typeof defaultVariantMapping;
    variantMapping?: { [key: string]: string };
    color?: "inherit" | "initial" | "primary" | "secondary" | "disabled" | "error";
    onClick?: ReactEventHandler<HTMLElement>;
    style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<C>;

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
    caption: "p",
    button: "span"
};

const colorToClasses = {
    inherit: "text-inherit",
    initial: "text-current",
    primary: "text-text-primary dark:text-text-primary-dark",
    secondary: "text-text-secondary dark:text-text-secondary-dark",
    disabled: "text-text-disabled dark:text-text-disabled-dark",
    error: "text-red-600 dark:text-red-500"
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
    caption: "text-xs",
    button: "text-sm font-medium"
};

export function Typography<C extends React.ElementType>(
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
        onClick,
        ...other
    }: TextProps<C>
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
        <Component className={classes}
                   onClick={onClick}
                   style={style}
                   {...other}>
            {children}
        </Component>
    );
}
