import React from "react";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export function Panel({
                          header,
                          children,
                          footer,
                          color = "transparent",
                          centered = false,
                          includeMargin = false,
                          includePadding = true,
                          className,
                          innerClassName,
                          container = true
                      }: {
    header?: React.ReactNode,
    children: React.ReactNode,
    footer?: React.ReactNode,
    color?: "gray" | "dark_gray" | "light_gray" | "white" | "white-to-slate" | "primary" | "secondary" | "light" |"light-to-white" | "lighter" | "transparent",
    centered?: boolean,
    includeMargin?: boolean,
    includePadding?: boolean,
    className?: string,
    innerClassName?: string,
    container?: boolean
}) {
//
    // color={"lighter"}
    //           className={"dark:bg-transparent text-gray-900 dark:text-white"}
    const colorClass = color === "transparent" ? "text-white" :
        color === "white" ? "bg-white text-text-primary" :
            color === "white-to-slate" ? "bg-gradient-to-b from-white to-slate-50 text-text-primary" :
                color === "light" ? "bg-gray-200 text-text-primary" :
                color === "light-to-white" ? "bg-gradient-to-b from-gray-100 to-white text-text-primary" :
                    color === "lighter" ? "bg-gray-100 text-text-primary" :
                        color === "light_gray" ? "bg-gray-700 text-white dark:text-white" :
                            color === "gray" ? "bg-gray-800 text-white dark:text-white" :
                                color === "dark_gray" ? "bg-gray-900 text-white dark:text-white" :
                                    color === "primary" ? "bg-primary text-white dark:text-white" :
                                        color === "secondary" ? "bg-secondary text-white dark:text-white" : "";

    const borderClass = color === "primary" ? "border-solid border-white border-opacity-20 dark:border-opacity-20" : defaultBorderMixin;

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
                borderClass,
                "border-x border-y-0",
                innerClassName
            )}>
                {header}
                {container ? <div className={"max-w-6xl mx-auto"}>{children}</div> : null}
                {!container ? children : null}
                {footer}
            </div>
        </section>
    );
}
