"use client";

import React, { useEffect } from "react";

export default function WebsiteError({
                                         error,
                                         reset,
                                     }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className={"flex-1 flex items-center justify-center p-8"}>
            <div className={"max-w-lg w-full flex flex-col items-center gap-4 p-8 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-sm"}>
                <h2 className={"text-xl font-semibold text-surface-900 dark:text-white"}>
                    Something went wrong
                </h2>
                {error?.message && (
                    <pre className={"w-full text-xs text-surface-500 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-3 rounded-lg overflow-auto max-h-[160px] whitespace-pre-wrap break-words"}>
                        {error.message}
                    </pre>
                )}
                <button
                    onClick={reset}
                    className={"px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"}
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
