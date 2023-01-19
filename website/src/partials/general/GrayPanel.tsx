import React from "react";
import { ContainerMixin } from "../utils";

export function GrayPanel({
                              children,
                              includeMargin = false
                          }: {
    children: React.ReactNode,
    includeMargin?: boolean
}) {
    return (
        <section
            className={"relative bg-gray-200 dark:bg-gray-800 p-4 py-16 md:p-16 flex flex-col items " + (includeMargin ? "mt-16" : "")}>
            <div className={ContainerMixin}>
                {children}
            </div>
        </section>
    );
}
