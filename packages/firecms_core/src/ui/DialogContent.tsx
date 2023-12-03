import React from "react";
import { cn } from "./util/cn";

export function DialogContent({
                                  children,
                                  className,
                                  fullHeight
                              }: {
    children: React.ReactNode,
    fullHeight?: boolean,
    className?: string
}) {

    if (fullHeight)
        return <div className={"flex-grow flex flex-col h-full relative"}>
            {children}
        </div>;

    return <div
        className={cn("py-6 px-6 h-full flex-grow", className)}>
        {children}
    </div>;
}
