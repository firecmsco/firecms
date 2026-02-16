import React, { useEffect, useState } from "react";
import { Entity, useDataSource, User } from "@firecms/core";
import { useHistoryController } from "../HistoryControllerProvider";

function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

/**
 * Fetches the latest history entry from the __history subcollection
 * and displays who last edited the entity and when.
 */
export function LastEditedByIndicator({
    path,
    entityId,
    collection
}: {
    path: string;
    entityId: string;
    collection: any;
}) {
    const { getUser } = useHistoryController();
    const dataSource = useDataSource();
    const [latestEntry, setLatestEntry] = useState<Entity | undefined>();

    useEffect(() => {
        if (!path || !entityId) return;

        const historyPath = `${path}/${entityId}/__history`;
        const unsubscribe = dataSource.listenCollection?.({
            path: historyPath,
            collection,
            orderBy: "__metadata.updated_on",
            order: "desc",
            limit: 1,
            onUpdate: (entities) => {
                setLatestEntry(entities[0]);
            },
            onError: (error) => {
                console.error("Error fetching latest history entry:", error);
            }
        });

        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [path, entityId, dataSource]);

    const metadata = latestEntry?.values?.__metadata;
    const uid = metadata?.updated_by;
    const editedOn = metadata?.updated_on;

    if (!uid && !editedOn) return null;

    const user: User | null | undefined = uid ? getUser?.(uid) : undefined;
    const date = editedOn instanceof Date ? editedOn : (editedOn?.toDate ? editedOn.toDate() : null);
    const timeString = date ? getRelativeTimeString(date) : null;

    const displayName = user?.displayName ?? user?.email ?? uid;
    const photoURL = user?.photoURL;

    return (
        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-secondary-dark">
            {photoURL ? (
                <img
                    src={photoURL}
                    alt={displayName ?? "User"}
                    className="rounded-full object-cover w-6 h-6"
                />
            ) : (
                <div className="rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark font-medium w-6 h-6 text-xs">
                    {(displayName ?? "?").charAt(0).toUpperCase()}
                </div>
            )}
            <span>
                {displayName}{timeString ? ` · ${timeString}` : ""}
            </span>
        </div>
    );
}
