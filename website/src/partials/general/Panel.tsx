import React from "react";
import { ContainerMixin, defaultBorderMixin } from "../styles";
import clsx from "clsx";

export function Panel({
                          children,
                          color = "gray",
                          centered = false,
                          includeMargin = false,
                          contained = false
                      }: {
    children: React.ReactNode,
    color?: "gray" | "primary" | "secondary" | "light",
    centered?: boolean,
    includeMargin?: boolean,
    contained?: boolean
}) {

    const colorClass = color === "light" ? "bg-light" :
        color === "gray" ? "bg-gray-100 dark:bg-gray-900" :
            color === "primary" ? "bg-primary text-white" :
                color === "secondary" ? "bg-secondary text-white" : "";

    return (
        <section
            className={"max-w-full relative flex flex-col items " + colorClass
                + (includeMargin ? " my-16" : "")}>
            <div className={clsx(
                ContainerMixin,
                (centered ? " flex flex-col items-center" : ""),
                defaultBorderMixin,
                "border-x border-y-0 border-solid"
            )}>
                <div className={(contained ? " my-16 max-w-3xl" : " my-12")}>
                    {children}
                </div>
            </div>
        </section>
    );
}
