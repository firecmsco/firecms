import { useEffect, useState } from "react";
import { useCollectionsConfigController } from "@firecms/collection_editor";
import { isCollectionsSetupOngoing, setupStaleAt } from "../utils/collections_setup_status";

/**
 * Whether this project's collection setup is still running, turning false by
 * itself once an "ongoing" status is too old to be true.
 */
export function useCollectionsSetupOngoing(): boolean {
    const collectionsSetup = useCollectionsConfigController().collectionsSetup;
    const [, setTick] = useState(0);

    const ongoing = isCollectionsSetupOngoing(collectionsSetup);
    const staleAt = setupStaleAt(collectionsSetup);

    useEffect(() => {
        if (staleAt === undefined) return;
        const timer = setTimeout(() => setTick(t => t + 1), staleAt - Date.now() + 1000);
        return () => clearTimeout(timer);
    }, [staleAt]);

    return ongoing;
}
