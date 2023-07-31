import React from "react";
import clsx from "clsx";

export function DialogContent({
                                  children,
                                  className,
                              }: {
    children: React.ReactNode,
    className?: string
}) {

    return <div
        className={clsx("py-6 px-4 h-full overflow-auto", className)}>
        {children}
        <div className={"h-16"}/>
    </div>;
}
