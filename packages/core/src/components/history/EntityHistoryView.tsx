import { useRef, useEffect } from "react";
import { EntityCustomViewParams } from "@rebasepro/types";
import {
    cls,
    HistoryIcon,
    IconButton,
    Label,
    Tooltip,
    Typography
} from "@rebasepro/ui";
import { EntityHistoryEntry } from "./EntityHistoryEntry";
import { useEntityHistory } from "../../hooks/useEntityHistory";
import { useSnackbarController, useAuthController } from "../../hooks";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { ErrorBoundary } from "../ErrorBoundary";
import { useState } from "react";

/**
 * Entity history tab view. Shows a paginated list of entity revisions
 * fetched from the backend API. Supports infinite scroll and revert.
 */
export function EntityHistoryView({
    entity,
    collection,
    formContext
}: EntityCustomViewParams) {

    const snackbarController = useSnackbarController();
    const authController = useAuthController();
    const dirty = formContext?.formex.dirty;

    const slug = collection.slug;
    const entityId = entity?.id;

    const {
        entries,
        isLoading,
        hasMore,
        loadMore,
        revert
    } = useEntityHistory({
        slug,
        entityId,
        enabled: !!entityId,
        pageSize: 10
    });

    const [revertHistoryId, setRevertHistoryId] = useState<string | undefined>();
    const [isReverting, setIsReverting] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const currentContainer = containerRef.current;
        const currentLoadMore = loadMoreRef.current;

        if (!currentContainer || !currentLoadMore || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (observerEntries) => {
                if (observerEntries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            {
                root: currentContainer,
                rootMargin: "0px 0px 200px 0px",
                threshold: 0.01
            }
        );

        observer.observe(currentLoadMore);

        return () => observer.disconnect();
    }, [hasMore, isLoading, entries.length, loadMore]);

    if (!entity) {
        return <div className="flex items-center justify-center h-full">
            <Label>History is only available for existing entities</Label>
        </div>;
    }

    async function doRevert(historyId: string) {
        setIsReverting(true);
        try {
            await revert(historyId);
            setRevertHistoryId(undefined);
            snackbarController.open({
                message: "Reverted to selected version",
                type: "info"
            });
        } catch (error) {
            console.error("Error reverting entity:", error);
            snackbarController.open({
                message: "Error reverting entity",
                type: "error"
            });
        } finally {
            setIsReverting(false);
        }
    }

    const revertEntry = revertHistoryId
        ? entries.find(e => e.id === revertHistoryId)
        : undefined;

    return <div
        ref={containerRef}
        className={cls("relative flex-1 h-full overflow-auto w-full flex flex-col gap-4 p-8")}>
        <div className="flex flex-col gap-2 max-w-6xl mx-auto w-full">

            <Typography variant={"h5"} className={"mt-24 ml-4"}>
                History
            </Typography>

            {isLoading && entries.length === 0 && (
                <div className="flex flex-col gap-4 mt-8 ml-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col gap-2 animate-pulse">
                            <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
                            <div className="h-12 w-full bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && entries.length === 0 && <>
                <Label className={"ml-4 mt-8"}>
                    No history available
                </Label>
                <Typography variant={"caption"} className={"ml-4"}>
                    When you save an entity, a new version is created and stored in the history.
                </Typography>
            </>}

            {entries.map((entry) => (
                <div key={entry.id} className="flex flex-cols gap-2 w-full">
                    <EntityHistoryEntry
                        entry={entry}
                        collection={collection}
                        size={"medium"}
                        actions={
                            <Tooltip title={"Revert to this version"}
                                className={"m-2 grow-0 self-start"}>
                                <IconButton
                                    onClick={() => {
                                        if (dirty) {
                                            snackbarController.open({
                                                message: "Please save or discard your changes before reverting",
                                                type: "warning"
                                            });
                                        } else {
                                            setRevertHistoryId(entry.id);
                                        }
                                    }}>
                                    <HistoryIcon />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                </div>
            ))}

            {/* Load more sentinel */}
            {entries.length > 0 && (
                <div ref={loadMoreRef} className="py-4 text-center">
                    {isLoading && <Label>Loading more...</Label>}
                    {!hasMore && entries.length > 10 && <Label>No more history available</Label>}
                </div>
            )}
        </div>

        <ErrorBoundary>
            <ConfirmationDialog
                open={Boolean(revertHistoryId)}
                onAccept={() => {
                    if (revertHistoryId) doRevert(revertHistoryId);
                }}
                onCancel={() => setRevertHistoryId(undefined)}
                title={<Typography variant={"subtitle2"}>Revert data to this version?</Typography>}
                body={revertEntry
                    ? <div className="p-4">
                        <Typography variant={"caption"} color={"secondary"}>
                            This will save the entity with the values from{" "}
                            {new Date(revertEntry.updated_at).toLocaleString()}.
                            A new history entry will be created for the revert.
                        </Typography>
                    </div>
                    : null
                }
            />
        </ErrorBoundary>
    </div>;
}
