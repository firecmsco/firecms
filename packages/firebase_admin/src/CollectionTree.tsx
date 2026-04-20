import React, { useEffect, useState } from "react";
import {
    cls,
    Typography,
    Skeleton,
    FolderIcon,
} from "@firecms/ui";
import { useAdminApi } from "./api/AdminApiProvider";

// Deterministic skeleton widths — avoids Math.random() which causes layout shifts on re-render
const SKELETON_WIDTHS = [65, 82, 55, 74, 90, 48];

/**
 * Flat list of root-level Firestore collections.
 *
 * Subcollections are NOT shown here — they are accessed
 * from the document detail panel after opening a specific document,
 * because subcollections live under documents, not under collections.
 */
export function CollectionTree({
    projectId,
    databaseId,
    selectedPath,
    onSelectCollection,
}: {
    projectId: string;
    databaseId?: string;
    selectedPath: string | null;
    onSelectCollection: (path: string) => void;
}) {
    const adminApi = useAdminApi();
    const [rootCollections, setRootCollections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true); // start true so skeletons show from frame 0
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setRootCollections([]);
        setLoading(true);
        setError(null);
        adminApi
            .listCollections(projectId, undefined, databaseId)
            .then(({ collections }) => {
                setRootCollections(
                    collections
                        .filter(name => !["__FIRECMS", "**", "*"].includes(name))
                        .sort()
                );

            })
            .catch(e => setError(e.message))
            .finally(() => {
                setLoading(false);
            });
    }, [projectId, databaseId]);

    if (loading && rootCollections.length === 0) {
        return (
            <div className="space-y-1 p-2">
                {SKELETON_WIDTHS.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-3">
                        <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                        <Skeleton className="h-4" style={{ width: `${w}%` }} />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </div>
        );
    }

    if (rootCollections.length === 0 && !loading) {
        return (
            <div className="p-4">
                <Typography color="secondary" variant="body2">
                    No collections found
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {rootCollections.map(collectionId => {
                const isSelected = selectedPath === collectionId
                    || (selectedPath != null && selectedPath.startsWith(collectionId + "/"));

                return (
                    <div
                        key={collectionId}
                        className={cls(
                            "flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors",
                            "hover:bg-surface-200 dark:hover:bg-surface-800",
                            isSelected && "bg-primary-bg dark:bg-primary/10"
                        )}
                        onClick={() => onSelectCollection(collectionId)}
                    >
                        <FolderIcon
                            size="smallest"
                            className={cls(
                                "flex-shrink-0",
                                isSelected ? "text-primary" : "text-amber-500 dark:text-amber-400"
                            )}
                        />
                        <Typography
                            variant="body2"
                            className={cls(
                                "flex-grow truncate text-sm",
                                isSelected && "text-primary font-medium"
                            )}
                        >
                            {collectionId}
                        </Typography>
                    </div>
                );
            })}
        </div>
    );
}
