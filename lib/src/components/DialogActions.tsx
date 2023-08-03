import React from "react";
import { defaultBorderMixin } from "../styles";
import { cn } from "./util/cn";

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
        className={cn(
            defaultBorderMixin,
            "py-3 px-4 border-t flex flex-row items-center justify-end bottom-0 right-0 left-0 text-right z-2 gap-2",
            position,
            "bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60",
            translucent ? "backdrop-blur-sm" : "",
            className)}>
        {children}
    </div>;
}
