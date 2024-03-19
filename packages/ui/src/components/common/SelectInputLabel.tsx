import React from "react";
import { cn } from "../../util";

export function SelectInputLabel({ children, error }: { children: React.ReactNode, error?: boolean }) {
    return <div className={cn("text-sm  font-medium ml-3.5 mb-1",
        error ? "text-red-500 dark:text-red-600" : "text-slate-500 dark:text-gray-300",)}>
        {children}
    </div>;
}
