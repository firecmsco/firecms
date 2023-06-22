import React from "react";
import clsx from "clsx";
import { defaultBorderMixin } from "../../styles";

export function DialogActions({
                                  children,
                                  position = "sticky",
                                  translucent = true
                              }: {
    children: React.ReactNode,
    position?: "sticky" | "absolute",
    translucent?: boolean
}) {

    return <div
        className={clsx(
            defaultBorderMixin,
            "py-4 px-8 border-t flex flex-row items-center justify-end bottom-0 right-0 left-0 text-right z-2 gap-1.5",
            position,
            "bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60",
            translucent ? "backdrop-blur-sm" : "")}>
        {children}
    </div>;
}
