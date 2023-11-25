import React from "react";
import { ContainerMixin, ContainerPaddingMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export function Panel({
                          children,
                          color = "gray",
                          centered = false,
                          includeMargin = false,
                          includePadding = true,
                          className
                      }: {
    children: React.ReactNode,
    color?: "gray" | "light_gray" | "primary" | "secondary" | "light" | "lighter" | "transparent",
    centered?: boolean,
    includeMargin?: boolean,
    includePadding?: boolean,
    className?: string
}) {

    const colorClass = color === "transparent" ? "bg-inherit text-text-primary" :
        color === "light" ? "bg-light text-text-primary" :
            color === "lighter" ? "bg-lighter text-text-primary" :
                color === "light_gray" ? "bg-gray-600 text-white" :
                    color === "gray" ? "bg-gray-800 text-white" :
                        color === "primary" ? "bg-primary text-white" :
                            color === "secondary" ? "bg-secondary text-white" : "";

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
                defaultBorderMixin,
                includePadding ? ContainerPaddingMixin : "",
                "border-x border-y-0 border-solid"
            )}>
                {children}
            </div>
        </section>
    );
}
