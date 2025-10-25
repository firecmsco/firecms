import React from "react";
import { defaultBorderMixin } from "../styles";
import { cls } from "../util";

export function DialogActions({
                                  children,
                                  position = "sticky",
                                  translucent = true,
                                  className
                              }: {
    children: React.ReactNode,
    position?: "sticky" | "absolute",
    translucent?: boolean,
    className?: string
}) {

    return <div
        className={cls(
            defaultBorderMixin,
            "py-3 px-4 border-t flex flex-row items-center justify-end bottom-0 right-0 left-0 text-right z-2 gap-2",
            position,
            "bg-white bg-opacity-60 bg-white/60 dark:bg-surface-900 dark:bg-opacity-60 dark:bg-surface-900/60",
            translucent ? "backdrop-blur-sm" : "",
            className)}>
        {children}
    </div>;
}
