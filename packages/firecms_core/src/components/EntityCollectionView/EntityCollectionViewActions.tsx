import React from "react";

import { canCreateEntity, canDeleteEntity, fullPathToCollectionSegments } from "../../util";
import { useAuthController, useFireCMSContext, useLargeLayout } from "../../hooks";
import { CollectionActionsProps, EntityCollection, SelectionController, TableController } from "../../types";
import { AddIcon, Button, DeleteIcon, IconButton, Tooltip } from "@firecms/ui";
import { toArray } from "../../util/arrays";
import { ErrorBoundary } from "../ErrorBoundary";

export type EntityCollectionViewActionsProps<M extends Record<string, any>> = {
    collection: EntityCollection<M>;
    path: string;
    relativePath: string;
    parentCollectionIds: string[];
    selectionEnabled: boolean;
    onNewClick: () => void;
    onMultipleDeleteClick: () => void;
    selectionController: SelectionController<M>;
    tableController: TableController<M>;
    collectionEntitiesCount: number;
}

export function EntityCollectionViewActions<M extends Record<string, any>>({
                                                                               collection,
                                                                               relativePath,
                                                                               parentCollectionIds,
                                                                               onNewClick,
                                                                               onMultipleDeleteClick,
                                                                               selectionEnabled,
                                                                               path,
                                                                               selectionController,
                                                                               tableController,
                                                                               collectionEntitiesCount
                                                                           }: EntityCollectionViewActionsProps<M>) {

    const context = useFireCMSContext();
    const plugins = context.plugins ?? [];

    const authController = useAuthController();

    const largeLayout = useLargeLayout();

    const selectedEntities = selectionController.selectedEntities;

    const addButton = canCreateEntity(collection, authController, fullPathToCollectionSegments(path), null) &&
        onNewClick && (largeLayout
            ? <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                startIcon={<AddIcon/>}
                size="large"
                variant="filled"
                color="primary">
                Add {collection.singularName ?? collection.name}
            </Button>
            : <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                size="medium"
                variant="filled"
                color="primary"
            >
                <AddIcon/>
            </Button>);

    const multipleDeleteEnabled = canDeleteEntity(collection, authController, fullPathToCollectionSegments(path), null);

    let multipleDeleteButton: React.ReactNode | undefined;
    if (selectionEnabled) {
        const button = largeLayout
            ? <Button
                variant={"text"}
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                startIcon={<DeleteIcon/>}
                onClick={onMultipleDeleteClick}
                color={"primary"}
                className="lg:w-20"
            >
                ({selectedEntities?.length})
            </Button>
            : <IconButton
                color={"primary"}
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                onClick={onMultipleDeleteClick}>
                <DeleteIcon/>
            </IconButton>;
        multipleDeleteButton =
            <Tooltip
                title={multipleDeleteEnabled ? "Delete" : "You have selected at least one entity you cannot delete"}>
                {button}
            </Tooltip>
    }

    const actionProps: CollectionActionsProps = {
        path,
        relativePath,
        parentCollectionIds,
        collection,
        selectionController,
        context,
        tableController,
        collectionEntitiesCount
    };

    const actions = toArray(collection.Actions)
        .map((Action, i) => (
            <ErrorBoundary key={`actions_${i}`}>
                <Action {...actionProps} />
            </ErrorBoundary>
        ));

    if (plugins) {
        plugins.forEach((plugin, i) => {
            if (plugin.collections?.CollectionActions) {
                actions.push(...toArray(plugin.collections?.CollectionActions)
                    .map((Action, j) => (
                        <ErrorBoundary key={`plugin_actions_${i}_${j}`}>
                            <Action {...actionProps} {...plugin.collections?.collectionActionsProps}/>
                        </ErrorBoundary>
                    )));
            }
        });
    }

    return (
        <>
            {actions}
            {multipleDeleteButton}
            {addButton}
        </>
    );
}
