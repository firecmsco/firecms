import clsx from "clsx";
import React from "react";
import { defaultBorderMixin } from "./styles";

export function BrowserFrame({ children, className, style, mode = "dark" }: {
    children: React.ReactNode,
    className?: string,
    style?: React.CSSProperties,
    mode?: "light" | "dark"
}) {
    return <div
        style={style}
        className={clsx("rounded-lg w-fit flex flex-col content-center justify-center border",
            defaultBorderMixin,
            className
        )}>
        <div
            className={clsx("h-11 rounded-t-lg  flex justify-start items-center gap-1.5 px-3",
                mode === "dark" ? "bg-gray-900" : "bg-gray-100")}>
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
        </div>

        {children}

    </div>;
}
