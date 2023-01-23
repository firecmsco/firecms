import React from "react";
import { ContainerMixin } from "../utils";

export function Panel({
                          children,
                          color = "gray",
                          centered = true,
                          includeMargin = false,
                          contained = false
                      }: {
    children: React.ReactNode,
    color: "gray" | "primary" | "secondary",
    centered?: boolean,
    includeMargin?: boolean,
    contained?: boolean
}) {

    const colorClass = color === "gray" ? "bg-gray-200 dark:bg-gray-800" :
        color === "primary" ? "bg-primary text-white" :
            color === "secondary" ? "bg-secondary text-white" : "";

    return (
        <section
            className={"relative py-16 flex flex-col items " + colorClass
                + (includeMargin ? " mt-16" : "")}>
            <div className={ContainerMixin
                + (contained ? " max-w-3xl" : " ")}>
                {children}
            </div>
        </section>
    );
}
