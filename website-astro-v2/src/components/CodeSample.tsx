import React from "react";
import { cls, Paper } from "@firecms/ui";

export type CodeSampleProps = {
    children: React.ReactNode;
    className?: string;
}

export default function CodeSample({
                                       children,
                                       className
                                   }: CodeSampleProps) {
    return (
        <Paper className={cls("p-8 bg-gray-50 bg-opacity-20 dark:bg-gray-800",
            "flex flex-row gap-4 items-center justify-center",
            className)}>
            {children}
        </Paper>
    );
}

