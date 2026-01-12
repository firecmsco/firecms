import React from "react";
import { Link } from "react-router-dom";
import {
    Card,
    Typography,
    cls,
    ImageIcon
} from "@firecms/ui";

export interface MediaLibraryCardProps {
    group?: string;
    context?: unknown;
}

/**
 * Card component displayed on the home page that links to the Media Library.
 */
export function MediaLibraryCard({ group }: MediaLibraryCardProps) {
    // Only render in the "Media" group
    if (group !== "Media") return null;

    return (
        <Link to="/media" className="no-underline">
            <Card
                className={cls(
                    "p-4 cursor-pointer",
                    "hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800",
                    "transition-colors duration-200",
                    "flex flex-col gap-2"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cls(
                        "w-10 h-10 rounded-lg",
                        "bg-primary/10 dark:bg-primary/20",
                        "flex items-center justify-center"
                    )}>
                        <ImageIcon className="text-primary" size="medium" />
                    </div>
                    <div className="flex-1">
                        <Typography variant="subtitle2" className="font-medium">
                            Media Library
                        </Typography>
                        <Typography
                            variant="caption"
                            className="text-surface-accent-600 dark:text-surface-accent-400"
                        >
                            Manage images and files
                        </Typography>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
