import {
    buildCollection,
    buildProperties,
    CollectionActionsProps,
    Entity,
    EntityCollection,
    useDataSource,
    useReferenceDialog,
    useSnackbarController
} from "@firecms/core";
import { useCallback } from "react";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
}

type CopyEntityButtonProps = {
    pathFrom: string;
    pathTo: string;
    collectionFrom: EntityCollection<any>;
    collectionTo: EntityCollection<any>;
};

function CopyEntityButton({
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

// Common properties of our target and source collections
const properties = buildProperties<Product>({
    name: {
        name: "Name",
        validation: { required: true },
        dataType: "string"
    },
    price: {
        name: "Price",
        validation: {
            required: true,
            min: 0
        },
        dataType: "number"
    }
});

// Source collection
export const productsCollection = buildCollection<Product>({
    name: "Products",
    id: "products",
    path: "products",
    properties
});

// Target collection
export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    id: "products_copied",
    path: "products_copied",
    properties,
    Actions: ({ path, collection }: CollectionActionsProps<Product>) =>
        <CopyEntityButton
            pathFrom={"products"}
            collectionFrom={productsCollection}
            pathTo={path}
            collectionTo={collection}
        />
});
