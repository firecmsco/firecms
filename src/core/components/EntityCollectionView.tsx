import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Popover,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

import {
    AnyProperty,
    CollectionSize,
    Entity,
    EntityCollection
} from "../../models";
import { CollectionTable, OnColumnResizeParams } from "../../collection";

import { CollectionRowActions } from "../../collection/internal/CollectionRowActions";
import { DeleteEntityDialog } from "../../collection/internal/DeleteEntityDialog";
import { ExportButton } from "../../collection/internal/ExportButton";

import { canCreate, canDelete, canEdit } from "../util/permissions";
import { Markdown } from "../../preview";
import {
    useAuthController,
    useFireCMSContext,
    useSideEntityController
} from "../../hooks";
import {
    getCollectionConfig,
    PartialEntityCollection,
    saveCollectionConfig
} from "../util/storage";
import { mergeDeep } from "../util/objects";

/**
 * @category Components
 */
export interface EntityCollectionViewProps<M extends { [Key: string]: any }> {
    path: string;
    collection: EntityCollection<M>;
}

/**
 * This component is in charge of binding a datasource path with an {@link EntityCollection}
 * where it's configuration is defined. This is useful if you have defined already
 * your entity collections and need to build a custom component.
 *
 * This component is the default one used for displaying entity collections
 * and is in charge of generating all the specific actions and customization
 * of the lower level {@link CollectionTable}
 *
 * Please **note** that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you need a lower level implementation with more granular options, you
 * can try {@link CollectionTable}.
 *
 * If you need a table that is not bound to the datasource or entities and
 * properties at all, you can check {@link Table}
 *
 * @param path
 * @param collectionConfig
 * @constructor
 * @category Components
 */
export function EntityCollectionView<M extends { [Key: string]: any }>({
                                                                           path,
                                                                           collection
                                                                       }: EntityCollectionViewProps<M>
) {

    const sideEntityController = useSideEntityController();
    const context = useFireCMSContext();
    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);
    const [extraConfiguration, setExtraConfiguration] = useState<PartialEntityCollection<M>>(getCollectionConfig(path));

    const mergedCollection: EntityCollection = mergeDeep(collection, extraConfiguration) as any;

    const exportable = mergedCollection.exportable === undefined || mergedCollection.exportable;

    const selectionEnabled = mergedCollection.selectionEnabled === undefined || mergedCollection.selectionEnabled;
    const hoverRow = mergedCollection.inlineEditing !== undefined && !mergedCollection.inlineEditing;

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const onEntityClick = (entity: Entity<M>) => {
        sideEntityController.open({
            entityId: entity.id,
            path,
            permissions: mergedCollection.permissions,
            schema: mergedCollection.schema,
            subcollections: mergedCollection.subcollections,
            callbacks: mergedCollection.callbacks,
            overrideSchemaResolver: false
        });
    };

    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return path && sideEntityController.open({
            path,
            permissions: mergedCollection.permissions,
            schema: mergedCollection.schema,
            subcollections: mergedCollection.subcollections,
            callbacks: mergedCollection.callbacks,
            overrideSchemaResolver: false
        });
    };

    const internalOnEntityDelete = (path: string, entity: Entity<M>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (path: string, entities: Entity<M>[]) => {
        setSelectedEntities([]);
        setDeleteEntityClicked(undefined);
    };

    const checkInlineEditing = (entity: Entity<any>) => {
        if (!canEdit(mergedCollection.permissions, entity, authController, path, context)) {
            return false;
        }
        return mergedCollection.inlineEditing === undefined || mergedCollection.inlineEditing;
    };


    const onColumnResize = ({ width, key }: OnColumnResizeParams) => {
        console.log("onColumnResize", width, key);
        const key1: keyof M = key as keyof M;
        const property: Partial<AnyProperty> = { columnWidth: width };
        const newCollection: PartialEntityCollection<M> = { ...extraConfiguration, ...{ schema: { properties: { [key1]: property } } } };
        setExtraConfiguration(newCollection);
        saveCollectionConfig(path, newCollection);
    };

    const open = anchorEl != null;
    const title = (
        <div style={{
            padding: "4px"
        }}>

            <Typography
                variant="h6"
                style={{
                    lineHeight: "1.0",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "160px",
                    cursor: mergedCollection.description ? "pointer" : "inherit"
                }}
                onClick={mergedCollection.description ? (e) => {
                    setAnchorEl(e.currentTarget);
                    e.stopPropagation();
                } : undefined}
            >
                {`${mergedCollection.name}`}
            </Typography>
            <Typography
                style={{
                    display: "block",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "160px",
                    direction: "rtl",
                    textAlign: "left"
                }}
                variant={"caption"}
                color={"textSecondary"}>
                {`/${path}`}
            </Typography>

            {mergedCollection.description &&
            <Popover
                id={"info-dialog"}
                open={open}
                anchorEl={anchorEl}
                elevation={1}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
            >

                <Box m={2}>
                    <Markdown source={mergedCollection.description}/>
                </Box>

            </Popover>
            }

        </div>
    );

    const toggleEntitySelection = (entity: Entity<M>) => {
        let newValue;
        if (selectedEntities.indexOf(entity) > -1) {
            newValue = selectedEntities.filter((item: Entity<M>) => item !== entity);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
        setDeleteEntityClicked(undefined);
    };

    const tableRowActionsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntities.indexOf(entity) > -1;

        const createEnabled = canCreate(mergedCollection.permissions, authController, path, context);
        const editEnabled = canEdit(mergedCollection.permissions, entity, authController, path, context);
        const deleteEnabled = canDelete(mergedCollection.permissions, entity, authController, path, context);

        const onCopyClicked = (entity: Entity<M>) => sideEntityController.open({
            entityId: entity.id,
            path,
            copy: true,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: mergedCollection.schema,
            subcollections: mergedCollection.subcollections,
            callbacks: mergedCollection.callbacks,
            overrideSchemaResolver: false
        });

        const onEditClicked = (entity: Entity<M>) => sideEntityController.open({
            entityId: entity.id,
            path,
            permissions: {
                edit: editEnabled,
                create: createEnabled,
                delete: deleteEnabled
            },
            schema: mergedCollection.schema,
            subcollections: mergedCollection.subcollections,
            callbacks: mergedCollection.callbacks,
            overrideSchemaResolver: false
        });

        return (
            <CollectionRowActions
                entity={entity}
                isSelected={isSelected}
                selectionEnabled={selectionEnabled}
                size={size}
                toggleEntitySelection={toggleEntitySelection}
                onEditClicked={onEditClicked}
                onCopyClicked={createEnabled ? onCopyClicked : undefined}
                onDeleteClicked={deleteEnabled ? setDeleteEntityClicked : undefined}
            />
        );

    };

    function toolbarActionsBuilder({
                                       size,
                                       data
                                   }: { size: CollectionSize, data: Entity<any>[] }) {

        const addButton = canCreate(mergedCollection.permissions, authController, path, context) && onNewClick && (largeLayout ?
            <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {mergedCollection.schema.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

        const multipleDeleteEnabled = selectedEntities.every((entity) => canDelete(mergedCollection.permissions, entity, authController, path, context));
        const onMultipleDeleteClick = (event: React.MouseEvent) => {
            event.stopPropagation();
            setDeleteEntityClicked(selectedEntities);
        };
        const multipleDeleteButton = selectionEnabled &&

            <Tooltip
                title={multipleDeleteEnabled ? "Multiple delete" : "You have selected one entity you cannot delete"}>
                <span>
                    {largeLayout && <Button
                        disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                        startIcon={<Delete/>}
                        onClick={onMultipleDeleteClick}
                        color={"primary"}
                    >
                        <p style={{ minWidth: 24 }}>({selectedEntities?.length})</p>
                    </Button>}

                    {!largeLayout &&
                    <IconButton
                        color={"primary"}
                        disabled={!(selectedEntities?.length) || !multipleDeleteEnabled}
                        onClick={onMultipleDeleteClick}
                        size="large">
                        <Delete/>
                    </IconButton>}
                </span>
            </Tooltip>;

        const extraActions = mergedCollection.extraActions ? mergedCollection.extraActions({
            path,
            collection,
            selectedEntities,
            context
        }) : undefined;

        const exportButton = exportable &&
            <ExportButton schema={mergedCollection.schema}
                          exportConfig={typeof mergedCollection.exportable === "object" ? mergedCollection.exportable : undefined}
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

    return (
        <>

            <CollectionTable
                title={title}
                path={path}
                collection={mergedCollection}
                inlineEditing={checkInlineEditing}
                onEntityClick={onEntityClick}
                onColumnResize={onColumnResize}
                tableRowActionsBuilder={tableRowActionsBuilder}
                toolbarActionsBuilder={toolbarActionsBuilder}
                hoverRow={hoverRow}
            />

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                path={path}
                                schema={mergedCollection.schema}
                                callbacks={mergedCollection.callbacks}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>
        </>
    );
}

