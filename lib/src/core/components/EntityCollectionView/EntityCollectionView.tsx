import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Popover, Typography, useTheme } from "@mui/material";
import equal from "react-fast-compare"

import {
    CollectionSize,
    Entity,
    EntityCollection,
    PartialEntityCollection,
    Property,
    SelectionController
} from "../../../types";
import {
    EntityCollectionTable,
    OnColumnResizeParams
} from "../EntityCollectionTable";

import {
    EntityCollectionRowActions
} from "../EntityCollectionTable/internal/EntityCollectionRowActions";
import {
    DeleteEntityDialog
} from "../EntityCollectionTable/internal/DeleteEntityDialog";

import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    fullPathToCollectionSegments,
    mergeDeep
} from "../../util";
import { Markdown, renderSkeletonText } from "../../../preview";
import {
    useAuthController,
    useDataSource,
    useFireCMSContext,
    useNavigationContext,
    useSideEntityController
} from "../../../hooks";
import {
    useUserConfigurationPersistence
} from "../../../hooks/useUserConfigurationPersistence";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import {
    useTableController
} from "../EntityCollectionTable/useTableController";
import {
    isFilterCombinationValidForFirestore
} from "./isFilterCombinationValidForFirestore";

/**
 * @category Components
 */
export type EntityCollectionViewProps<M extends Record<string, any>> = {
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
 * If you need a generic table that is not bound to the datasource or entities and
 * properties at all, you can check {@link VirtualTable}
 *
 * @param fullPath
 * @param collection
 * @constructor
 * @category Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends Record<string, any>>({
                                                                     fullPath,
                                                                     isSubCollection,
                                                                     ...collectionProp
                                                                 }: EntityCollectionViewProps<M>
    ) {

        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const context = useFireCMSContext();

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(fullPath);
            return userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp;
        }, [collectionProp, fullPath, userConfigPersistence?.getCollectionConfig]);

        const theme = useTheme();

        const [selectedNavigationEntity, setSelectedNavigationEntity] = useState<Entity<M> | undefined>(undefined);
        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const [lastDeleteTimestamp, setLastDeleteTimestamp] = React.useState<number>(0);

        const unselectNavigatedEntity = useCallback(() => {
            const currentSelection = selectedNavigationEntity;
            setTimeout(() => {
                if (currentSelection === selectedNavigationEntity)
                    setSelectedNavigationEntity(undefined);
            }, 2400);
        }, [selectedNavigationEntity]);

        const checkInlineEditing = useCallback((entity?: Entity<any>): boolean => {
            if (!canEditEntity(collection, authController, fullPathToCollectionSegments(fullPath), entity ?? null)) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [collection, authController, fullPath]);

        const exportable = collection.exportable === undefined || collection.exportable;

        const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
        const hoverRow = !checkInlineEditing();

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

        const tableController = useTableController<M>({
            fullPath,
            collection,
            entitiesDisplayedFirst: [],
            isFilterCombinationValid: isFilterCombinationValidForFirestore,
            lastDeleteTimestamp
        });

        const onEntityClick = useCallback((clickedEntity: Entity<M>) => {
            setSelectedNavigationEntity(clickedEntity);
            context.onAnalyticsEvent?.("edit_entity_clicked", {
                path: clickedEntity.path,
                entityId: clickedEntity.id
            });
            return sideEntityController.open({
                entityId: clickedEntity.id,
                path: fullPath,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity
            });
        }, [fullPath, collection, sideEntityController]);

        const onNewClick = useCallback(() => {
            context.onAnalyticsEvent?.("new_entity_click", {
                path: fullPath
            });
            sideEntityController.open({
                path: fullPath,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity
            });
        }, [fullPath, collection, sideEntityController]);

        const onSingleDeleteClick = useCallback((selectedEntity: Entity<any>) => {
            context.onAnalyticsEvent?.("single_delete_dialog_open", {
                path: fullPath
            });
            setDeleteEntityClicked(selectedEntity);
        }, [context, fullPath]);

        const onMultipleDeleteClick = useCallback(() => {
            context.onAnalyticsEvent?.("multiple_delete_dialog_open", {
                path: fullPath
            });
            setDeleteEntityClicked(selectedEntities);
        }, [context, fullPath, selectedEntities]);

        const internalOnEntityDelete = useCallback((_path: string, entity: Entity<M>) => {
            context.onAnalyticsEvent?.("single_entity_deleted", {
                path: fullPath
            });
            setSelectedEntities((selectedEntities) => selectedEntities.filter((e) => e.id !== entity.id));
            setLastDeleteTimestamp(Date.now());
        }, [context, fullPath, setSelectedEntities]);

        const internalOnMultipleEntitiesDelete = useCallback((_path: string, entities: Entity<M>[]) => {
            context.onAnalyticsEvent?.("multiple_entities_deleted", {
                path: fullPath
            });
            setSelectedEntities([]);
            setDeleteEntityClicked(undefined);
            setLastDeleteTimestamp(Date.now());
        }, [setSelectedEntities]);

        const onCollectionModifiedForUser = useCallback((path: string, partialCollection: PartialEntityCollection<M>) => {
            if (userConfigPersistence) {
                const currentStoredConfig = userConfigPersistence.getCollectionConfig(path);
                const updatedConfig = mergeDeep(currentStoredConfig, partialCollection);
                userConfigPersistence.onCollectionModified(path, updatedConfig);
            }
        }, [userConfigPersistence]);

        const onColumnResize = useCallback(({
                                                width,
                                                key
                                            }: OnColumnResizeParams) => {
            // Only for property columns
            if (!collection.properties[key]) return;
            const property: Partial<Property> = { columnWidth: width };
            const localCollection = { properties: { [key as keyof M]: property } } as PartialEntityCollection<M>;
            onCollectionModifiedForUser(fullPath, localCollection);
        }, [collection, onCollectionModifiedForUser, fullPath]);

        const onSizeChanged = useCallback((size: CollectionSize) => {
            if (userConfigPersistence)
                onCollectionModifiedForUser(fullPath, { defaultSize: size })
        }, [onCollectionModifiedForUser, fullPath, userConfigPersistence]);

        const open = anchorEl != null;

        const Title = useMemo(() => (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                contain: "content",
                "& > *:not(:last-child)": {
                    [theme.breakpoints.down("md")]: {
                        mr: theme.spacing(1)
                    },
                    mr: theme.spacing(2)
                }
            }}>
                <Box>
                    <Typography
                        variant={"h6"}
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
                    <EntitiesCount fullPath={fullPath}/>

                    {collection.description &&
                        <Popover
                            id={"info-dialog"}
                            open={open}
                            anchorEl={anchorEl}
                            elevation={3}
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
        ), [theme, collection.description, collection.name, fullPath, open, anchorEl]);

        const createEnabled = canCreateEntity(collection, authController, fullPathToCollectionSegments(fullPath), null);

        const onCopyClicked = useCallback((clickedEntity: Entity<M>) => {
            setSelectedNavigationEntity(clickedEntity);
            context.onAnalyticsEvent?.("copy_entity_click", {
                path: clickedEntity.path,
                entityId: clickedEntity.id
            });
            sideEntityController.open({
                entityId: clickedEntity.id,
                path: fullPath,
                copy: true,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity
            });
        }, [sideEntityController, collection, fullPath, unselectNavigatedEntity]);

        const onEditClicked = useCallback((clickedEntity: Entity<M>) => {
            setSelectedNavigationEntity(clickedEntity);
            context.onAnalyticsEvent?.("entity_click", {
                path: clickedEntity.path,
                entityId: clickedEntity.id
            });
            sideEntityController.open({
                entityId: clickedEntity.id,
                path: fullPath,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity
            });
        }, [sideEntityController, collection, fullPath, unselectNavigatedEntity]);

        const tableRowActionsBuilder = useCallback(({
                                                        entity,
                                                        size,
                                                        width,
                                                        frozen
                                                    }: { entity: Entity<any>, size: CollectionSize, width: number, frozen?: boolean }) => {

            const isSelected = isEntitySelected(entity);

            const deleteEnabled = canDeleteEntity(collection, authController, fullPathToCollectionSegments(fullPath), entity);

            return (
                <EntityCollectionRowActions
                    entity={entity}
                    width={width}
                    frozen={frozen}
                    isSelected={isSelected}
                    selectionEnabled={selectionEnabled}
                    size={size}
                    toggleEntitySelection={toggleEntitySelection}
                    onEditClicked={onEditClicked}
                    onCopyClicked={createEnabled ? onCopyClicked : undefined}
                    onDeleteClicked={deleteEnabled ? onSingleDeleteClick : undefined}
                    hideId={collection?.hideIdFromCollection}
                />
            );

        }, [isEntitySelected, collection, authController, fullPath, selectionEnabled, toggleEntitySelection, onEditClicked, createEnabled, onCopyClicked]);

        return (
            <Box sx={{
                overflow: "hidden",
                height: "100%",
                width: "100%"
            }}>
                <EntityCollectionTable
                    key={`collection_table_${fullPath}`}
                    fullPath={fullPath}
                    tableController={tableController}
                    onSizeChanged={onSizeChanged}
                    onEntityClick={onEntityClick}
                    onColumnResize={onColumnResize}
                    tableRowActionsBuilder={tableRowActionsBuilder}
                    title={Title}
                    selectionController={usedSelectionController}
                    highlightedEntities={selectedNavigationEntity ? [selectedNavigationEntity] : []}
                    {...collection}
                    actions={<EntityCollectionViewActions
                        collection={collection}
                        exportable={exportable}
                        onMultipleDeleteClick={onMultipleDeleteClick}
                        onNewClick={onNewClick}
                        path={fullPath}
                        loadedEntities={tableController.data}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}/>}
                    hoverRow={hoverRow}
                    inlineEditing={checkInlineEditing()}
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

            </Box>
        );
    }, equal) as React.FunctionComponent<EntityCollectionViewProps<any>>

export function useSelectionController<M extends Record<string, any>>(): SelectionController<M> {

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

function EntitiesCount({ fullPath }: { fullPath: string }) {

    const dataSource = useDataSource();
    const navigation = useNavigationContext();
    const [count, setCount] = useState<number | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        dataSource.countEntities(navigation.resolveAliasesFrom(fullPath)).then(setCount).catch(setError);
    }, [fullPath, dataSource, navigation]);

    if (error) {
        return null;
    }

    return <Typography
        sx={{
            display: "block",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: "160px",
            textAlign: "left"
        }}
        variant={"caption"}
        color={"textSecondary"}>
        {count !== undefined ? `${count} entities` : renderSkeletonText()}
    </Typography>;
}
