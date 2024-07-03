import React from "react";
import { cls } from "../util";

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
        className={cls("py-6 px-6 h-full flex-grow", className)}>
        {children}
    </div>;
}
