import { cn } from "@firecms/ui";
import React from "react";

export const ColumnTitle = ({
                                children,
                                className,
                                ...props
                            }: any) => {
    return (
        <h4
            className={
                cn("py-2 px-4 transition-colors duration-200 flex-grow select-none relative outline-none focus:outline focus:outline-2 focus:outline-offset-2",
                    "text-sm font-semibold text-gray-800 dark:text-gray-200",
                    className)
            }
            {...props}
        >
            {children}
        </h4>
    );
};
