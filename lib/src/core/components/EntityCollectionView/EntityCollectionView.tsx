import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Popover, Typography, useTheme } from "@mui/material";
import equal from "react-fast-compare"

import {
    AnyProperty,
    CollectionSize,
    Entity,
    EntityCollection,
    LocalEntityCollection,
    SelectionController
} from "../../../models";
import {
    EntityCollectionTable,
    OnColumnResizeParams
} from "../CollectionTable";

import {
    CollectionRowActions
} from "../CollectionTable/internal/CollectionRowActions";
import {
    DeleteEntityDialog
} from "../CollectionTable/internal/DeleteEntityDialog";

import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    fullPathToCollectionSegments,
    mergeDeep,
    removeInitialAndTrailingSlashes
} from "../../util";
import { Markdown } from "../../../preview";
import { useAuthController, useSideEntityController } from "../../../hooks";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";

/**
 * @category Components
 */
export type EntityCollectionViewProps<M extends { [Key: string]: unknown }> = {
    fullPath: string;
    isSubCollection?: boolean;
} & EntityCollection<M>;

/**
 * This component is in charge of binding a datasource path with an {@link EntityCollection}
 * where it's configuration is defined. It includes an infinite scrolling table
 * and a 'Add' new entities button,
 *
 * This component is the default one used for displaying entity collections
 * and is in charge of generating all the specific actions and customization
 * of the lower level {@link EntityCollectionTable}
 *
 * Please **note** that you only need to use this component if you are building
 * a custom view. If you just need to create a default view you can do it
 * exclusively with config options.
 *
 * If you need a lower level implementation with more granular options, you
 * can use {@link EntityCollectionTable}.
 *
 * If you need a table that is not bound to the datasource or entities and
 * properties at all, you can check {@link Table}
 *
 * @param fullPath
 * @param collection
 * @constructor
 * @category Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends { [Key: string]: unknown }>({
                                                                                    fullPath,
                                                                                    isSubCollection,
                                                                                    ...collection
                                                                                }: EntityCollectionViewProps<M>
    ) {

        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();

        const theme = useTheme();

        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const exportable = collection.exportable === undefined || collection.exportable;

        const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
        const hoverRow = collection.inlineEditing !== undefined && !collection.inlineEditing;

        const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

        const selectionController = useSelectionController<M>();
        const usedSelectionController = collection.selectionController ?? selectionController;
        const {
            selectedEntities,
            toggleEntitySelection,
            isEntitySelected,
            setSelectedEntities
        } = usedSelectionController;

        useEffect(() => {
            setDeleteEntityClicked(undefined);
        }, [selectedEntities]);

        const onEntityClick = useCallback((entity: Entity<M>) => {
            return sideEntityController.open({
                entityId: entity.id,
                path: fullPath,
                collection,
                updateUrl: true
            });
        }, [fullPath, collection, collection]);

        const onNewClick = useCallback(() =>
            sideEntityController.open({
                path: fullPath,
                collection,
                updateUrl: true
            }), [fullPath, collection, collection, sideEntityController]);

        const onMultipleDeleteClick = useCallback(() => {
            setDeleteEntityClicked(selectedEntities);
        }, [selectedEntities]);

        const internalOnEntityDelete = useCallback((_path: string, entity: Entity<M>) => {
            setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
        }, [selectedEntities, setSelectedEntities]);

        const internalOnMultipleEntitiesDelete = useCallback((_path: string, entities: Entity<M>[]) => {
            setSelectedEntities([]);
            setDeleteEntityClicked(undefined);
        }, [setSelectedEntities]);

        const checkInlineEditing = useCallback((entity: Entity<any>) => {
            if (!canEditEntity(collection, authController, fullPathToCollectionSegments(fullPath))) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [collection.inlineEditing, collection, fullPath]);

        const onCollectionModifiedForUser = useCallback((path: string, partialCollection: LocalEntityCollection<M>) => {
            if (userConfigPersistence) {
                const currentStoredConfig = userConfigPersistence.getCollectionConfig(path);
                userConfigPersistence.onCollectionModified(path, mergeDeep(currentStoredConfig, partialCollection));
            }
        }, [userConfigPersistence]);

        const onColumnResize = useCallback(({
                                                width,
                                                key
                                            }: OnColumnResizeParams) => {
            // Only for property columns
            if (!collection.properties[key]) return;
            const property: Partial<AnyProperty> = { columnWidth: width };
            const localCollection = { properties: { [key as keyof M]: property } } as LocalEntityCollection<M>;
            onCollectionModifiedForUser(fullPath, localCollection);
        }, [collection.properties, onCollectionModifiedForUser, fullPath]);

        const onSizeChanged = useCallback((size: CollectionSize) => {
            if (userConfigPersistence)
                onCollectionModifiedForUser(fullPath, { defaultSize: size })
        }, [onCollectionModifiedForUser, fullPath, userConfigPersistence]);

        const open = anchorEl != null;

        const Title = useMemo(() => (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                "& > *:not(:last-child)": {
                    [theme.breakpoints.down("md")]: {
                        mr: theme.spacing(1)
                    },
                    mr: theme.spacing(2)
                }
            }}>
                <Box>
                    <Typography
                        variant={ "h6" }
                        sx={{
                            lineHeight: "1.15",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            maxWidth: "164px",
                            cursor: collection.description ? "pointer" : "inherit"
                        }}
                        onClick={collection.description
                            ? (e) => {
                                setAnchorEl(e.currentTarget);
                                e.stopPropagation();
                            }
                            : undefined}
                    >
                        {`${collection.name}`}
                    </Typography>
                    <Typography
                        sx={{
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
                        {`/${removeInitialAndTrailingSlashes(fullPath)}/`}
                    </Typography>

                    {collection.description &&
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
                                <Markdown source={collection.description}/>
                            </Box>

                        </Popover>
                    }

                </Box>

            </Box>
        ), [collection.description, collection.singularName, fullPath, open, anchorEl]);

        const tableRowActionsBuilder = useCallback(({
                                                        entity,
                                                        size
                                                    }: { entity: Entity<any>, size: CollectionSize }) => {

            const isSelected = isEntitySelected(entity);

            const createEnabled = canCreateEntity(collection, authController, fullPathToCollectionSegments(fullPath));
            const deleteEnabled = canDeleteEntity(collection, authController, fullPathToCollectionSegments(fullPath));

            const onCopyClicked = (clickedEntity: Entity<M>) => sideEntityController.open({
                entityId: clickedEntity.id,
                path: fullPath,
                copy: true,
                collection,
                updateUrl: true
            });

            const onEditClicked = (clickedEntity: Entity<M>) => sideEntityController.open({
                entityId: clickedEntity.id,
                path: fullPath,
                collection,
                updateUrl: true
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

        }, [usedSelectionController, collection, collection, authController, fullPath]);

        return (
            <>

                <EntityCollectionTable
                    key={`collection_table_${fullPath}`}
                    path={fullPath}
                    collection={collection}
                    onSizeChanged={onSizeChanged}
                    inlineEditing={checkInlineEditing}
                    onEntityClick={onEntityClick}
                    onColumnResize={onColumnResize}
                    tableRowActionsBuilder={tableRowActionsBuilder}
                    Title={Title}
                    Actions={<EntityCollectionViewActions
                        collection={collection}
                        exportable={exportable}
                        onMultipleDeleteClick={onMultipleDeleteClick}
                        onNewClick={onNewClick}
                        path={fullPath}
                        selectedEntities={selectedEntities}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}/>}
                    hoverRow={hoverRow}
                />

                {deleteEntityClicked &&
                    <DeleteEntityDialog
                        entityOrEntitiesToDelete={deleteEntityClicked}
                        path={fullPath}
                        collection={collection}
                        callbacks={collection.callbacks}
                        open={Boolean(deleteEntityClicked)}
                        onEntityDelete={internalOnEntityDelete}
                        onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                        onClose={() => setDeleteEntityClicked(undefined)}/>}

            </>
        );
    }, equal) as React.FunctionComponent<EntityCollectionViewProps<any>>

export function useSelectionController<M = any>(): SelectionController {

    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const toggleEntitySelection = useCallback((entity: Entity<M>) => {
        let newValue;
        if (selectedEntities.map(e => e.id).includes(entity.id)) {
            newValue = selectedEntities.filter((item: Entity<M>) => item.id !== entity.id);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
    }, [selectedEntities]);

    const isEntitySelected = useCallback((entity: Entity<M>) => selectedEntities.map(e => e.id).includes(entity.id), [selectedEntities]);

    return {
        selectedEntities,
        setSelectedEntities,
        isEntitySelected,
        toggleEntitySelection
    };
}
