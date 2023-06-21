import React from "react";
import clsx from "clsx";

export function CustomDialogActions({
                                        children,
                                        position = "sticky",
                                        translucent = true
                                    }: {
    children: React.ReactNode,
    position?: "sticky" | "absolute",
    translucent?: boolean
}) {

    return <div
        className={clsx(`py-4 px-8 border-t border-gray-100 dark:border-gray-800 flex flex-row items-center justify-end ${position} bottom-0 right-0 left-0 text-right z-2`,
            translucent ? "backdrop-blur-sm" : "")}>
        {children}
    </div>;
}
