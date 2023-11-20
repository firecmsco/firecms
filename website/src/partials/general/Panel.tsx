import React from "react";
import { ContainerMixin } from "../utils";

export function Panel({
                          children,
                          color = "gray",
                          centered = false,
                          includeMargin = false,
                          contained = false
                      }: {
    children: React.ReactNode,
    color?: "gray" | "primary" | "secondary",
    centered?: boolean,
    includeMargin?: boolean,
    contained?: boolean
}) {

    const colorClass = color === "gray" ? "bg-slate-100 dark:bg-slate-900" :
        color === "primary" ? "bg-primary text-white" :
            color === "secondary" ? "bg-secondary text-white" : "";

    return (
        <section
            className={"max-w-full relative flex flex-col items " + colorClass
                + (includeMargin ? " my-16" : "")}>
            <div className={(contained ? " my-16 max-w-3xl" : " my-12")}>
                <div className={ContainerMixin + (centered ? " flex flex-col items-center" : "")}>
                {children}
                </div>
            </div>
        </section>
    );
}
