import React from "react";
import { cls } from "../util";

export function DialogContent({
                                  children,
                                  className,
                                  fullHeight,
                                  includeMargin = true
                              }: {
    children: React.ReactNode,
    includeMargin?: boolean,
    fullHeight?: boolean,
    className?: string
}) {

    if (fullHeight)
        return <div className={"grow flex flex-col h-full relative"}>
            {children}
        </div>;

    return <div
        className={cls("grow",
            { "my-6 mx-6": includeMargin },
            className)}>
        {children}
    </div>;
}
