import React from "react";
import { cn } from "./util/cn";

export function DialogContent({
                                  children,
                                  className,
                              }: {
    children: React.ReactNode,
    className?: string
}) {

    return <div
        className={cn("py-6 px-6 h-full flex-grow", className)}>
        {children}
    </div>;
}
