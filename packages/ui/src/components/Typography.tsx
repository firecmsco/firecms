import React, { ReactEventHandler } from "react";
import { cls } from "../util";

export type TypographyVariant = keyof typeof typographyVariants;
export type TypographyProps<C extends React.ElementType = "span"> = {
    align?: "center" | "inherit" | "justify" | "left" | "right";
    children?: React.ReactNode;
    className?: string;
    component?: C;
    gutterBottom?: boolean;
    noWrap?: boolean;
    paragraph?: boolean;
    variant?: TypographyVariant;
    variantMapping?: { [key: string]: string };
    color?: "inherit" | "initial" | "primary" | "secondary" | "disabled" | "error";
    onClick?: ReactEventHandler<HTMLElement>;
    style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<C>;

const typographyVariants = {
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

const gutterBottomClasses = {
    h1: "mb-5",
    h2: "mb-4",
    h3: "mb-4",
    h4: "mb-4",
    h5: "mb-3",
    h6: "mb-3",
    subtitle1: "mb-3",
    subtitle2: "mb-3",
    body1: "mb-3",
    body2: "mb-3",
    inherit: "mb-3",
    caption: "mb-2",
    button: "mb-2",
    label: "mb-2"
};

const variantToClasses = {
    h1: "typography-h1",
    h2: "typography-h2",
    h3: "typography-h3",
    h4: "typography-h4",
    h5: "typography-h5",
    h6: "typography-h6",
    subtitle1: "typography-subtitle1",
    subtitle2: "typography-subtitle2",
    body1: "typography-body1",
    body2: "typography-body2",
    label: "typography-label",
    inherit: "typography-inherit",
    caption: "typography-caption",
    button: "typography-button"
};

export function Typography<C extends React.ElementType = "span">(
    {
        align = "inherit",
        color = "primary",
        children,
        className,
        component,
        gutterBottom = false,
        noWrap = false,
        paragraph = false,
        variant = "body1",
        variantMapping = typographyVariants,
        style,
        onClick,
        ...other
    }: TypographyProps<C>
) {
    const Component =
        component ||
        (paragraph ? "p" : variantMapping[variant] || typographyVariants[variant]) ||
        "span";

    const classes = cls(
        variantToClasses[variant],
        color ? colorToClasses[color] : "",
        align !== "inherit" && `text-${align}`,
        gutterBottom && gutterBottomClasses[variant],
        noWrap && "truncate",
        paragraph && "mb-3",
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
