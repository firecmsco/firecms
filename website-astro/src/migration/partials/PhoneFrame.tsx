import clsx from "clsx";
import React from "react";

export function PhoneFrame({ children, className }: {
    children: React.ReactNode,
    className?: string
}) {
    return <div
        className={clsx("relative w-72 mx-auto", className)}>
        <div
            className="h-6 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-16"></div>
        <div
            className="h-8 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-28"></div>
        <div
            className="h-8 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-40"></div>
        <div
            className="h-auto w-72 bg-black rounded-3xl p-.5 overflow-hidden">
            <div
                className="h-full w-full bg-black rounded-4xl overflow-hidden p-2 relative">
                <div
                    className="w-8 h-4 bg-black absolute left-1/2 rounded-b-2xl transform -translate-x-1/2"></div>
                {children}
            </div>
        </div>
        <div
            className="h-14 w-0.5 rounded-l-sm bg-black absolute -right-0.5 top-32"></div>
    </div>
}
