import React from "react";
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";

import { Add, Delete, Settings } from "@mui/icons-material";
import { ExportButton } from "../CollectionTable/internal/ExportButton";

import { canCreateEntity, canDeleteEntity } from "../../util/permissions";
import { useAuthController, useFireCMSContext } from "../../../hooks";
import {
    Entity,
    EntityCollection,
    ExportConfig,
    SelectionController
} from "../../../models";

export type EntityCollectionViewActionsProps<M> = {
    collection: EntityCollection<M>;
    path: string;
    selectionEnabled: boolean;
    exportable: boolean | ExportConfig<M>;
    onNewClick: () => void;
    onMultipleDeleteClick: () => void;
    selectedEntities: Entity<M>[];
    selectionController: SelectionController;
}

export function EntityCollectionViewActions<M>({
                                                   collection,
                                                   onNewClick,
                                                   exportable,
                                                   onMultipleDeleteClick,
                                                   selectionEnabled,
                                                   path,
                                                   selectionController,
                                                   selectedEntities
                                               }: EntityCollectionViewActionsProps<M>) {

    const context = useFireCMSContext();
    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const addButton = canCreateEntity(collection.permissions, authController, path, context) && onNewClick && (largeLayout
        ? <Button
            onClick={onNewClick}
            startIcon={<Add/>}
            size="large"
            variant="contained"
            color="primary">
            Add {collection.name}
        </Button>
        : <Button
            onClick={onNewClick}
            size="medium"
            variant="contained"
            color="primary"
        >
            <Add/>
        </Button>);

    const multipleDeleteEnabled = selectedEntities.every((entity) => canDeleteEntity(collection.permissions, entity, authController, path, context));

    let multipleDeleteButton: JSX.Element | undefined;
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
                onClick={onMultipleDeleteClick}
                size="large">
                <Delete/>
            </IconButton>;
        multipleDeleteButton =
            <Tooltip
                title={multipleDeleteEnabled ? "Multiple delete" : "You have selected one entity you cannot delete"}>
                <span>{button}</span>
            </Tooltip>
    }

    const extraActions = collection.extraActions
        ? collection.extraActions({
            path,
            collection,
            selectionController,
            context
        })
        : undefined;

    const exportButton = exportable &&
        <ExportButton collection={collection}
                      exportConfig={typeof collection.exportable === "object" ? collection.exportable : undefined}
                      path={path}/>;
    return (
        <>
            {extraActions}
            {multipleDeleteButton}
            {exportButton}
            {addButton}
        </>
    );
}
