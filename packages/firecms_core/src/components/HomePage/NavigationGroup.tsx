import React, { PropsWithChildren } from "react";
import { cls, Typography } from "@firecms/ui";

export function NavigationGroup({
                                    children,
                                    group,
                                    minimised,
                                    isPreview,
                                    isPotentialCardDropTarget,
                                }: PropsWithChildren<{
    group: string | undefined,
    minimised?: boolean,
    isPreview?: boolean,
    isPotentialCardDropTarget?: boolean
}>) {
    return (
        <div className={cls(
            // isPreview ? "" : "mb-8",
            !isPotentialCardDropTarget ? "my-12" : "my-8",
            "transition-all duration-200 ease-in-out",
        )}>
            <Typography
                variant={isPreview ? "body2" : "caption"}
                component={"h2"}
                color="secondary"
                // Minimal padding and no margin for preview title
                className={`${isPreview ? "px-1 py-0.5 m-0" : "ml-3.5 mt-6"} font-medium uppercase text-sm text-surface-600 dark:text-surface-400`}
            >
                {group ?? "Views"}
            </Typography>

            {isPreview ? (
                children
            ) : minimised ? (
                // For minimised view in the main list
                <div className={cls("mt-4 p-8 bg-surface-accent-200 dark:bg-surface-accent-800 rounded-lg")}
                     style={{ minHeight: "50px" }}>
                </div>
            ) : (
                // If highlighted, the parent div already has padding, so children (NavigationGroupDroppable) don't need extra margin top as much.
                // The inner content of NavigationGroupDroppable will define its own padding if needed when active.
                <div className={cls("mt-4", !minimised ? "pt-0" : "", )}>
                    {children}
                </div>
            )}
        </div>
    );
}
