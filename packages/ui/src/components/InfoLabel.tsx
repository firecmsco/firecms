import React from "react";
import { cls } from "../util";

// The text colour is set explicitly rather than inherited: these backgrounds
// flip between themes, so a label rendered outside a Scaffold (which supplies
// `dark:text-white`) used to end up dark-on-dark.
const colorClasses = {
    info: "bg-sky-200 text-sky-950 dark:bg-teal-900 dark:text-teal-50",
    warn: "bg-orange-200 text-orange-950 dark:bg-yellow-950 dark:text-yellow-50"
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
            className={cls("my-3 py-2 px-4 rounded-xs", colorClasses[mode])}>
            {children}
        </div>
    )
}
