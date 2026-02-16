import { LoadingButton } from "@firecms/ui";
import { useCollectionsConfigController } from "@firecms/collection_editor";
import { EntityCustomViewParams, useSnackbarController } from "@firecms/core";
import React from "react";

export function EnableEntityHistoryView({
                                            parentCollectionIds,
                                            collection
                                        }: EntityCustomViewParams) {

    const [loading, setLoading] = React.useState(false);
    const configController = useCollectionsConfigController();
    const [enabled, setEnabled] = React.useState(collection.history);

    const snackbarController = useSnackbarController();
    return <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        Enable the entity history in this collection to view the history of changes made to entities.
        This feature allows you to track modifications, additions, and deletions over time, providing a comprehensive
        audit trail for your data.

        <LoadingButton
            loading={loading}

            disabled={enabled}
            onClick={() => {
                setLoading(true);
                configController.saveCollection({
                    id: collection.id,
                    collectionData: {
                        ...collection,
                        history: true,
                    },
                    parentCollectionIds
                })
                    .then(() => {
                        setEnabled(true);
                        snackbarController.open({
                            type: "success",
                            message: "History enabled for collection " + collection.name
                        });
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }}>
            Enable History for this collection
        </LoadingButton>
    </div>
}
