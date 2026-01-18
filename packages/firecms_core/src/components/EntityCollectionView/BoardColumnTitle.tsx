import { cls } from "@firecms/ui";
import React from "react";

interface BoardColumnTitleProps {
    children: React.ReactNode;
    className?: string;
    "aria-label"?: string;
}

export function BoardColumnTitle({
    children,
    className,
    ...props
}: BoardColumnTitleProps) {
    return (
        <h4
            className={
                cls("py-2 px-4 transition-colors duration-200 flex-grow select-none relative outline-none focus:outline focus:outline-2 focus:outline-offset-2",
                    "text-sm font-semibold text-surface-800 dark:text-surface-200",
                    className)
            }
            {...props}
        >
            {children}
        </h4>
    );
}
