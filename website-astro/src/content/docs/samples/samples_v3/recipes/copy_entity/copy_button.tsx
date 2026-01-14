import { useCallback } from "react";
import { Entity, EntityCollection, useDataSource, useReferenceDialog, useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export type CopyEntityButtonProps = {
    pathFrom: string;
    pathTo: string;
    collectionFrom: EntityCollection;
    collectionTo: EntityCollection;
};

export function CopyEntityButton({
                                     pathFrom,
                                     collectionFrom,
                                     pathTo,
                                     collectionTo
                                 }: CopyEntityButtonProps) {

    // The datasource allows us to create new documents
    const dataSource = useDataSource();

    // We use a snackbar to indicate success
    const snackbarController = useSnackbarController();

    // We declare a callback function for the reference dialog that will
    // create the new entity and show a snackbar when completed
    const copyEntity = useCallback((entity: Entity<any> | null) => {
        if (entity) {
            dataSource.saveEntity({
                path: pathTo,
                values: entity.values,
                entityId: entity.id,
                collection: collectionTo,
                status: "new"
            }).then(() => {
                snackbarController.open({
                    type: "success",
                    message: "Copied entity " + entity.id
                });
            });
        }
    }, [collectionTo, dataSource, pathTo, snackbarController]);

    // This dialog is used to prompt the selected collection
    const referenceDialog = useReferenceDialog({
        path: pathFrom,
        collection: collectionFrom,
        multiselect: false,
        onSingleEntitySelected: copyEntity
    });

    return (
        <Button onClick={referenceDialog.open}>
            Copy from {pathFrom}
        </Button>
    );
}
