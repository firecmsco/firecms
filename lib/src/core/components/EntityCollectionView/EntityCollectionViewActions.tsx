import React from "react";

import { ExportButton } from "../EntityCollectionTable/internal/ExportButton";

import { canCreateEntity, canDeleteEntity, fullPathToCollectionSegments } from "../../util";
import { useAuthController, useFireCMSContext } from "../../../hooks";
import { CollectionActionsProps, Entity, EntityCollection, ExportConfig, SelectionController } from "../../../types";
import { Button, IconButton, Tooltip } from "../../../components";
import { useLargeLayout } from "../../../hooks/useLargeLayout";
import { AddIcon, DeleteIcon } from "../../../icons";
import { toArray } from "../../util/arrays";
import { TableController } from "../EntityCollectionTable/useTableController";

export type EntityCollectionViewActionsProps<M extends Record<string, any>> = {
    collection: EntityCollection<M>;
    path: string;
    relativePath: string;
    parentPathSegments: string[];
    selectionEnabled: boolean;
    exportable: boolean | ExportConfig;
    onNewClick: () => void;
    onMultipleDeleteClick: () => void;
    selectionController: SelectionController<M>;
    tableController: TableController<M>;
}

export function EntityCollectionViewActions<M extends Record<string, any>>({
                                                                               collection,
                                                                               relativePath,
                                                                               parentPathSegments,
                                                                               onNewClick,
                                                                               exportable,
                                                                               onMultipleDeleteClick,
                                                                               selectionEnabled,
                                                                               path,
                                                                               selectionController,
                                                                               tableController
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
        parentPathSegments,
        collection,
        selectionController,
        context,
        tableController
    };

    const allActions: React.ComponentType<any>[] = [];
    allActions.push(...toArray(collection.Actions));
    if (plugins) {
        plugins.forEach(plugin => {
            if (plugin.collections?.CollectionActions) {
                allActions.push(...toArray(plugin.collections?.CollectionActions));
            }
        });
    }

    const actions = <>
            {allActions.map((Action, i) => (
                <Action key={`actions_${i}`} {...actionProps} />
            ))}
        </>
    ;

    const exportButton = exportable &&
        <ExportButton collection={collection}
                      exportConfig={typeof collection.exportable === "object" ? collection.exportable : undefined}
                      path={path}/>;

    return (
        <>
            {actions}
            {multipleDeleteButton}
            {exportButton}
            {addButton}
        </>
    );
}
