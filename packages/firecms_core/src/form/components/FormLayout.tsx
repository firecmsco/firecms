import React from "react";
import { cls } from "@firecms/ui";

export function FormLayout({
                               children,
                               className
                           }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cls("flex flex-wrap gap-x-4 w-full space-y-8", className)}>
            {children}
        </div>
    );
}
