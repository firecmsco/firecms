import React from "react";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export function Panel({
                          children,
                          color = "transparent",
                          centered = false,
                          includeMargin = false,
                          includePadding = true,
                          className,
                          innerClassName
                      }: {
    children: React.ReactNode,
    color?: "gray" | "light_gray" | "white" | "primary" | "secondary" | "light" | "lighter" | "transparent",
    centered?: boolean,
    includeMargin?: boolean,
    includePadding?: boolean,
    className?: string,
    innerClassName?: string,
}) {

    const colorClass = color === "transparent" ? "" :
        color === "white" ? "bg-white text-text-primary" :
            color === "light" ? "bg-gray-100 text-text-primary" :
                color === "lighter" ? "bg-gray-50 text-text-primary" :
                    color === "light_gray" ? "bg-gray-700 text-white dark:text-white" :
                        color === "gray" ? "bg-gray-800 text-white dark:text-white" :
                            color === "primary" ? "bg-primary text-white dark:text-white" :
                                color === "secondary" ? "bg-secondary text-white dark:text-white" : "";

    return (
        <section
            className={clsx("max-w-full relative flex flex-col items ",
                colorClass,
                includeMargin ? " my-16" : "",
                "border-0 border-t",
                defaultBorderMixin,
                className
            )}>
            <div className={clsx(
                ContainerMixin,
                (centered ? " flex flex-col items-center" : ""),
                includePadding ? ContainerPaddingMixin : "",
                defaultBorderMixin,
                "border-x border-y-0 border-solid",
                innerClassName
            )}>
                {children}
            </div>
        </section>
    );
}
