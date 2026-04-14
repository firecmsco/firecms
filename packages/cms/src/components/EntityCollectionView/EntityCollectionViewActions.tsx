import type { EntityCollection } from "@rebasepro/types";
import React from "react";

import { useAuthController, useRebaseContext, useLargeLayout, useTranslation, useSlot } from "@rebasepro/core";
import { CollectionActionsProps, EntityTableController, SelectionController, ViewMode } from "@rebasepro/types";
import {
    AddIcon,
    Button,
    DeleteIcon,
    IconButton,
    Tooltip
} from "@rebasepro/ui";
import { ErrorBoundary } from "@rebasepro/ui";
import { usePermissions } from "@rebasepro/core";
import { toArray } from "@rebasepro/utils";
import { ImportCollectionAction } from "../../data_import/import";
import { ExportCollectionAction } from "../../data_export/export";
import { EditorCollectionAction } from "../../collection_editor/ui/EditorCollectionAction";
import { useCollectionEditorController } from "../../collection_editor/useCollectionEditorController";

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

    const context = useRebaseContext();

    const { canCreate, canDelete } = usePermissions();

    const largeLayout = useLargeLayout();
    const { t } = useTranslation();

    // Check if the collection editor context is available (ConfigControllerProvider present)
    const collectionEditorController = useCollectionEditorController();
    const hasCollectionEditor = Boolean(collectionEditorController?.editCollection);

    const selectedEntities = selectionController.selectedEntities;

    const addButton = canCreate(collection, path) &&
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

    const multipleDeleteEnabled = canDelete(collection, path, null);

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
                title={multipleDeleteEnabled ? t("delete") : t("delete_not_allowed")}>
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

    const pluginActions = useSlot("collection.actions", actionProps);

    return (
        <>
            <ErrorBoundary>
                {actions}
                {pluginActions}
            </ErrorBoundary>
            <ErrorBoundary>
                <ImportCollectionAction {...actionProps} />
            </ErrorBoundary>
            <ErrorBoundary>
                <ExportCollectionAction {...actionProps} />
            </ErrorBoundary>
            {hasCollectionEditor && (
                <ErrorBoundary>
                    <EditorCollectionAction {...actionProps} />
                </ErrorBoundary>
            )}
            {multipleDeleteButton}
            {addButton}
        </>
    );
}
