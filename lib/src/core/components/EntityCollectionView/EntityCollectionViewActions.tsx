import React from "react";
import {
    Button,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";

import { Add, Delete } from "@mui/icons-material";
import { ExportButton } from "../EntityCollectionTable/internal/ExportButton";

import { canCreateEntity, canDeleteEntity } from "../../util/permissions";
import { useAuthController, useFireCMSContext } from "../../../hooks";
import {
    CollectionActionsProps,
    Entity,
    EntityCollection,
    ExportConfig,
    SelectionController
} from "../../../types";
import { fullPathToCollectionSegments } from "../../util/paths";

export type EntityCollectionViewActionsProps<M extends Record<string, any>> = {
    collection: EntityCollection<M>;
    path: string;
    selectionEnabled: boolean;
    exportable: boolean | ExportConfig;
    onNewClick: () => void;
    onMultipleDeleteClick: () => void;
    selectionController: SelectionController<M>;
    loadedEntities: Entity<M>[];

}

export function EntityCollectionViewActions<M extends Record<string, any>>({
                                                                               collection,
                                                                               onNewClick,
                                                                               exportable,
                                                                               onMultipleDeleteClick,
                                                                               selectionEnabled,
                                                                               path,
                                                                               selectionController,
                                                                               loadedEntities
                                                                           }: EntityCollectionViewActionsProps<M>) {

    const context = useFireCMSContext();
    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const selectedEntities = selectionController.selectedEntities;

    const addButton = canCreateEntity(collection, authController, fullPathToCollectionSegments(path), null) &&
        onNewClick && (largeLayout
            ? <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {collection.singularName ?? collection.name}
            </Button>
            : <Button
                id={`add_entity_${path}`}
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

    const multipleDeleteEnabled = canDeleteEntity(collection, authController, fullPathToCollectionSegments(path), null);

    let multipleDeleteButton: React.ReactNode | undefined;
    if (selectionEnabled) {
        const button = largeLayout
            ? <Button
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                startIcon={<Delete/>}
                onClick={onMultipleDeleteClick}
                color={"primary"}
                sx={{ minWidth: 68 }}
            >
                ({selectedEntities?.length})
            </Button>
            : <IconButton
                color={"primary"}
                disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                onClick={onMultipleDeleteClick}>
                <Delete/>
            </IconButton>;
        multipleDeleteButton =
            <Tooltip
                title={multipleDeleteEnabled ? "Delete" : "You have selected at least one entity you cannot delete"}>
                <span>{button}</span>
            </Tooltip>
    }

    const actionProps: CollectionActionsProps = {
        path,
        collection,
        selectionController,
        context,
        loadedEntities
    };

    const actions = collection.Actions
        ? Array.isArray(collection.Actions)
            ? <>
                {collection.Actions.map((Action, i) => (
                    <Action key={`actions_${i}`} {...actionProps} />
                ))}
            </>
            : <collection.Actions {...actionProps} />
        : undefined;

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
