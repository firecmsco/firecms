import React, { PropsWithChildren, useState } from "react";
import { cls, EditIcon, IconButton, Typography } from "@firecms/ui";

export function NavigationGroup({
                                    children,
                                    group,
                                    minimised,
                                    isPreview,
                                    isPotentialCardDropTarget,
                                    onEditGroup, // New prop to handle editing
                                    dndDisabled // New prop to disable editing when D&D is off
                                }: PropsWithChildren<{
    group: string | undefined,
    minimised?: boolean,
    isPreview?: boolean,
    isPotentialCardDropTarget?: boolean,
    onEditGroup?: (groupName: string) => void; // Callback to open dialog
    dndDisabled?: boolean; // Added dndDisabled prop
}>) {

    const [isHovered, setIsHovered] = useState(false);
    const currentGroupName = group ?? "Views";

    return (
        <div className={cls(
            !isPotentialCardDropTarget ? "my-10" : "my-6",
            "transition-all duration-200 ease-in-out"
        )}
        >
            <div className={`flex items-center ${isPreview ? "px-1 py-0.5 m-0" : "ml-3.5 mt-6"} `}

                 onMouseEnter={() => setIsHovered(true)}
                 onMouseLeave={() => setIsHovered(false)}>
                <Typography
                    variant={isPreview ? "body2" : "caption"}
                    component={"h2"}
                    color="secondary"
                    // Minimal padding and no margin for preview title
                    className={`${isPreview ? "px-1 py-0.5" : "ml-3.5"} font-medium uppercase text-sm text-surface-600 dark:text-surface-400`}
                >
                    {currentGroupName}
                </Typography>
                {!isPreview && onEditGroup && !dndDisabled && (
                    <IconButton
                        size="smallest"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent other click events
                            onEditGroup(currentGroupName);
                        }}
                        className={cls("ml-2 ", isHovered ? "opacity-100" : "opacity-0", "transition-opacity duration-100")}
                    >
                        <EditIcon size="smallest"/>
                    </IconButton>
                )}
            </div>

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
                <div className={cls("mt-4", !minimised ? "pt-0" : "")}>
                    {children}
                </div>
            )}
        </div>
    );
}
