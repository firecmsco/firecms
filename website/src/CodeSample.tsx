import React, { Suspense } from "react";
import { cls, Paper } from "@firecms/ui";
import BrowserOnly from "@docusaurus/BrowserOnly";

export type CodeSampleProps = {
    children: React.ReactNode;
    className?: string;
}

export default function CodeSample({
                                       children,
                                       className
                                   }: CodeSampleProps) {
    return (
        <Paper className={cls("p-8 bg-gray-50/20 dark:bg-gray-800",
            "flex flex-row gap-4 items-center justify-center",
            className)}>
            <BrowserOnly
                fallback={<div/>}>
                {() => (
                    <Suspense fallback={<div/>}>
                        {children}
                    </Suspense>
                )}
            </BrowserOnly>
        </Paper>
    );
}
