import React from "react";
import { cls } from "../util";

const colorClasses = {
    info: "bg-sky-200 dark:bg-teal-900",
    warn: "bg-orange-200 dark:bg-yellow-950"
}

export function InfoLabel({
                              children,
                              mode = "info"
                          }: {
    children: React.ReactNode,
    mode?: "info" | "warn"
}) {

    return (
        <div
            className={cls("my-3 py-2 px-4 rounded", colorClasses[mode])}>
            {children}
        </div>
    )
}
