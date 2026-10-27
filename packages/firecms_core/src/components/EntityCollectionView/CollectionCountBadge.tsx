import React from "react";
import { Skeleton } from "@firecms/ui";

/**
 * Number of entities in a collection, as shown next to its name.
 * `undefined` renders nothing, `null` a loading placeholder.
 */
export function CollectionCountBadge({ count }: { count: number | null | undefined }) {
    if (count === undefined)
        return null;
    if (count === null)
        return <Skeleton className="w-8 h-4 rounded-md"/>;
    return <span
        className="text-xs text-surface-accent-500 dark:text-surface-accent-400 bg-surface-100 dark:bg-surface-700 px-1 py-0 rounded">
        {count}
    </span>;
}
