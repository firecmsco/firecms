import React from "react";

import { canCreateEntity, canDeleteEntity } from "../../util";
import { useAuthController, useCustomizationController, useFireCMSContext, useLargeLayout } from "../../hooks";
import {
    CollectionActionsProps,
    EntityCollection,
    EntityTableController,
    SelectionController
} from "../../types";
import {
    AddIcon,
    Button,
    DeleteIcon,
    IconButton,
    Tooltip
} from "@firecms/ui";
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
    tableController: EntityTableController<M>;
    collectionEntitiesCount?: number;
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
    collectionEntitiesCount,
}: EntityCollectionViewActionsProps<M>) {

    const context = useFireCMSContext();

    const customizationController = useCustomizationController();
    const plugins = customizationController.plugins ?? [];

    const authController = useAuthController();

    const largeLayout = useLargeLayout();

    const selectedEntities = selectionController.selectedEntities;

    const addButton = canCreateEntity(collection, authController, path, null) &&
        onNewClick && (largeLayout
            ? <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                startIcon={<AddIcon size={"small"} />}
                variant="filled"
                color="primary">
                Add {collection.singularName ?? collection.name}
            </Button>
            : <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                variant="filled"
                color="primary"
            >
                <AddIcon size={"small"} />
            </Button>);

    const multipleDeleteEnabled = canDeleteEntity(collection, authController, path, null);

    let multipleDeleteButton: React.ReactNode | undefined;
    if (selectionEnabled) {
        const button = largeLayout
            ? <Button
                variant={"text"}
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                startIcon={<DeleteIcon size={"small"} />}
                onClick={onMultipleDeleteClick}
                color={"primary"}
                className="lg:w-20"
            >
                ({selectedEntities?.length})
            </Button>
            : <IconButton
                size={"small"}
                color={"primary"}
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                onClick={onMultipleDeleteClick}>
                <DeleteIcon size={"small"} />
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
            if (plugin.collectionView?.CollectionActions) {
                actions.push(...toArray(plugin.collectionView?.CollectionActions)
                    .map((Action, j) => (
                        <ErrorBoundary key={`plugin_actions_${i}_${j}`}>
                            <Action {...actionProps} {...plugin.collectionView?.collectionActionsProps} />
                        </ErrorBoundary>
                    )));
            }
        });
    }

    return (
        <>
            <ErrorBoundary>
                {actions}
            </ErrorBoundary>
            {multipleDeleteButton}
            {addButton}
        </>
    );
}
