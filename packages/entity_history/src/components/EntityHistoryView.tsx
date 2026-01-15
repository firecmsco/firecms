import { useEffect, useRef, useState } from "react";
import {
    ConfirmationDialog,
    Entity,
    EntityCustomViewParams,
    EntityView,
    ErrorBoundary,
    useAuthController,
    useDataSource,
    useSnackbarController
} from "@firecms/core";
import { cls, HistoryIcon, IconButton, Label, Tooltip, Typography } from "@firecms/ui";
import { EntityHistoryEntry } from "./EntityHistoryEntry";

export function EntityHistoryView({
                                      entity,
                                      collection,
                                      formContext
                                  }: EntityCustomViewParams) {

    const authController = useAuthController();
    const snackbarController = useSnackbarController();
    const dirty = formContext?.formex.dirty;

    const dataSource = useDataSource();
    const pathAndId = entity ? entity?.path + "/" + entity?.id : undefined;

    const [revertVersionDialog, setRevertVersionDialog] = useState<Entity | undefined>(undefined);
    const [revisions, setRevisions] = useState<Entity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 5;
    const [limit, setLimit] = useState(PAGE_SIZE);

    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Load revisions with the current limit
    useEffect(() => {
        if (!pathAndId) return;

        setIsLoading(true); // Set loading true when fetching starts
        const listener = dataSource.listenCollection?.({
            path: pathAndId + "/__history",
            collection: collection,
            order: "desc",
            orderBy: "__metadata.updated_on",
            limit: limit,
            startAfter: undefined,
            onUpdate: (entities) => {
                setRevisions(entities);
                setHasMore(entities.length === limit && entities.length >= PAGE_SIZE); // Ensure we fetched a full page to consider hasMore
                setIsLoading(false);
            },
            onError: (error) => {
                console.error("Error fetching history:", error);
                setIsLoading(false);
                setHasMore(false); // Stop trying if there's an error
            }
        });
        return () => {
            if (typeof listener === "function") {
                listener();
            }
        };
    }, [pathAndId, limit, dataSource]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        const currentContainer = containerRef.current;
        const currentLoadMore = loadMoreRef.current;

        // Conditions for active observation
        if (!currentContainer || !currentLoadMore || !hasMore || isLoading) {
            // If we shouldn't be observing, ensure any existing observer is disconnected
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            return;
        }

        // Options for the IntersectionObserver
        const options = {
            root: currentContainer,
            rootMargin: "0px 0px 200px 0px", // Trigger 200px before the sentinel is at the bottom edge
            threshold: 0.01 // Trigger if even a small part is visible within the rootMargin
        };

        // The callback for when the sentinel's intersection state changes
        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !isLoading) {
                // No need to setIsLoading(true) here, it's done in the data fetching useEffect
                setLimit(prev => prev + PAGE_SIZE);
            }
        };

        const observer = new IntersectionObserver(handleObserver, options);
        observer.observe(currentLoadMore);
        observerRef.current = observer; // Store the new observer

        // Cleanup function for this effect instance
        return () => {
            observer.disconnect(); // Disconnect the observer created in *this* effect run
            if (observerRef.current === observer) {
                observerRef.current = null;
            }
        };
        // Re-run if hasMore, isLoading changes, or if revisions.length changes (which might make loadMoreRef available/unavailable)
    }, [hasMore, isLoading, revisions.length]);

    if (!entity) {
        return <div className="flex items-center justify-center h-full">
            <Label>History is only available for existing entities</Label>
        </div>
    }

    function doRevert(revertVersion: Entity) {
        if (!entity) {
            throw new Error("No entity to revert");
        }
        const revertValues = {
            ...revertVersion.values,
            __metadata: {
                // @ts-ignore
                ...revertVersion.values?.["__metadata"],
                reverted: true,
                updated_on: new Date(),
                updated_by: authController.user?.uid ?? null,
            }
        };
        const saveReverted = dataSource.saveEntity({
            path: entity.path,
            entityId: entity.id,
            values: revertValues,
            collection,
            status: "existing"
        });
        const saveRevertedHistory = dataSource.saveEntity({
            path: revertVersion.path,
            entityId: revertVersion.id,
            values: revertValues,
            collection,
            status: "existing"
        });
        return Promise.all([saveReverted, saveRevertedHistory])
            .then(() => {
                    formContext.formex.resetForm({
                        values: revertVersion.values
                    });
                    setRevertVersionDialog(undefined);
                    snackbarController.open({
                        message: "Reverted version",
                        type: "info"
                    });
                }
            ).catch((error) => {
                console.error("Error reverting entity:", error);
                snackbarController.open({
                    message: "Error reverting entity",
                    type: "error"
                });
            });

    }

    return <div
        ref={containerRef}
        className={cls("relative flex-1 h-full overflow-auto w-full flex flex-col gap-4 p-8")}>
        <div className="flex flex-col gap-2 max-w-6xl mx-auto w-full">

            <Typography variant={"h5"} className={"mt-24 ml-4"}>
                History
            </Typography>

            {revisions.length === 0 && <>
                <Label className={"ml-4 mt-8"}>
                    No history available
                </Label>
                <Typography variant={"caption"} className={"ml-4"}>
                    When you save an entity, a new version is created and stored in the history.
                </Typography>
            </>}

            {revisions.map((revision, index) => {

                // @ts-ignore
                const previewKeys = revision.values?.["__metadata"]?.["changed_fields"];
                // @ts-ignore
                const previousValues: object | undefined = revision.values?.["__metadata"]?.["previous_values"];
                return <div key={index} className="flex flex-cols gap-2 w-full">
                    <EntityHistoryEntry size={"large"}
                                        entity={revision}
                                        collection={collection}
                                        previewKeys={previewKeys}
                                        previousValues={previousValues}
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
                                                            setRevertVersionDialog(revision);
                                                        }
                                                    }}>
                                                    <HistoryIcon/>
                                                </IconButton>
                                            </Tooltip>}
                    />
                </div>
            })}

            {/* Load more sentinel element */}
            {revisions.length > 0 && (
                <div
                    ref={loadMoreRef}
                    className="py-4 text-center"
                >
                    {isLoading && <Label>Loading more...</Label>}
                    {!hasMore && revisions.length > PAGE_SIZE && <Label>No more history available</Label>}
                </div>
            )}
        </div>

        <ErrorBoundary>
            <ConfirmationDialog open={Boolean(revertVersionDialog)}
                                onAccept={function (): void {
                                    if (!revertVersionDialog) return;
                                    doRevert(revertVersionDialog);
                                }}
                                onCancel={function (): void {
                                    setRevertVersionDialog(undefined);
                                }}
                                title={<Typography variant={"subtitle2"}>Revert data to this version?</Typography>}
                                body={revertVersionDialog ?
                                    <EntityView entity={revertVersionDialog}
                                                collection={collection}
                                                path={entity?.path}/> : null}/>
        </ErrorBoundary>
    </div>
}
