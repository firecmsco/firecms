import React, { useCallback, useEffect, useMemo, useState } from "react";

import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    FilterValues,
    PartialEntityCollection,
    PropertyOrBuilder,
    SaveEntityProps,
    SelectionController
} from "../../../types";
import {
    EntityCollectionTable,
    OnCellValueChange,
    OnColumnResizeParams,
    UniqueFieldValidator
} from "../EntityCollectionTable";

import { EntityCollectionRowActions } from "../EntityCollectionTable/internal/EntityCollectionRowActions";
import { DeleteEntityDialog } from "../EntityCollectionTable/internal/DeleteEntityDialog";

import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    fullPathToCollectionSegments,
    getPropertyInPath,
    mergeDeep,
    resolveCollection,
    resolveProperty
} from "../../util";
import { Markdown, ReferencePreview } from "../../../preview";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useFireCMSContext,
    useNavigationContext,
    useSideEntityController
} from "../../../hooks";
import { useUserConfigurationPersistence } from "../../../hooks/useUserConfigurationPersistence";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import { useCollectionTableController } from "../EntityCollectionTable/useCollectionTableController";
import { Button, cn, Typography } from "../../../components";
import { Popover } from "../../../components/Popover";
import { Skeleton } from "../../../components/Skeleton";
import { setIn } from "formik";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import { KeyboardTabIcon } from "../../../icons";
import { useColumnIds } from "./useColumnsIds";
import { PopupFormField } from "../EntityCollectionTable/internal/popup_field/PopupFormField";
import { GetPropertyForProps } from "../EntityCollectionTable/EntityCollectionTableProps";

const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

/**
 * @category Components
 */
export type EntityCollectionViewProps<M extends Record<string, any>> = {
    fullPath: string;
    parentPathSegments?: string[];
    isSubCollection?: boolean;
    className?: string;
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
                                                                     parentPathSegments,
                                                                     isSubCollection,
                                                                     className,
                                                                     ...collectionProp
                                                                 }: EntityCollectionViewProps<M>
    ) {

        const dataSource = useDataSource();
        const navigation = useNavigationContext();
        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const context = useFireCMSContext();

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(fullPath);
            return userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp;
        }, [collectionProp, fullPath, userConfigPersistence?.getCollectionConfig]);

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

        const [popOverOpen, setPopOverOpen] = useState(false);

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

        const tableController = useCollectionTableController<M>({
            fullPath,
            collection,
            entitiesDisplayedFirst: [],
            lastDeleteTimestamp
        });

        const tableKey = React.useRef<string>(Math.random().toString(36));
        const popupCell = tableController.popupCell;

        const onPopupClose = useCallback(() => {
            tableController.setPopupCell?.(undefined);
        }, [tableController.setPopupCell]);

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
            if (!getPropertyInPath(collection.properties, key)) return;
            const localCollection = buildPropertyWidthOverwrite(key, width);
            onCollectionModifiedForUser(fullPath, localCollection);
        }, [collection, onCollectionModifiedForUser, fullPath]);

        const onSizeChanged = useCallback((size: CollectionSize) => {
            if (userConfigPersistence)
                onCollectionModifiedForUser(fullPath, { defaultSize: size })
        }, [onCollectionModifiedForUser, fullPath, userConfigPersistence]);

        const createEnabled = canCreateEntity(collection, authController, fullPathToCollectionSegments(fullPath), null);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                 name,
                 value,
                 property,
                 entityId
             }) => dataSource.checkUniqueField(fullPath, name, value, property, entityId),
            [fullPath]);

        const onValueChange: OnCellValueChange<any, any> = ({
                                                                fullPath,
                                                                context,
                                                                value,
                                                                propertyKey,
                                                                onValueUpdated,
                                                                setError,
                                                                entity
                                                            }) => {

            const updatedValues = setIn({ ...entity.values }, propertyKey, value);

            const saveProps: SaveEntityProps = {
                path: fullPath,
                entityId: entity.id,
                values: updatedValues,
                previousValues: entity.values,
                collection,
                status: "existing"
            };

            return saveEntityWithCallbacks({
                ...saveProps,
                callbacks: collection.callbacks,
                dataSource,
                context,
                onSaveSuccess: () => onValueUpdated(),
                onSaveFailure: (e: Error) => {
                    console.error("Save failure");
                    console.error(e);
                    setError(e);
                }
            });

        };

        const resolvedFullPath = navigation.resolveAliasesFrom(fullPath);
        const resolvedCollection = useMemo(() => resolveCollection<M>({
            collection,
            path: fullPath,
            fields: context.fields
        }), [collection, fullPath]);

        const getPropertyFor = useCallback(({ propertyKey, propertyValue, entity }: GetPropertyForProps<M>) => {
            let propertyOrBuilder: PropertyOrBuilder<any, M> | undefined = getPropertyInPath<M>(collection.properties, propertyKey);

            // we might not find the property in the collection if combining property builders and map spread
            if (!propertyOrBuilder) {
                // these 2 properties are coming from the resolved collection with default values
                propertyOrBuilder = getPropertyInPath<M>(resolvedCollection.properties, propertyKey);
            }

            return resolveProperty({
                propertyKey,
                propertyOrBuilder,
                path: fullPath,
                propertyValue,
                values: entity.values,
                entityId: entity.id,
                fields: context.fields
            });
        }, [collection.properties, context.fields, fullPath, resolvedCollection.properties]);

        const displayedColumnIds = useColumnIds(resolvedCollection, true);

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
                path: clickedEntity.path,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity
            });
        }, [sideEntityController, collection, fullPath, unselectNavigatedEntity]);

        const additionalFields = useMemo(() => {
            const subcollectionColumns: AdditionalFieldDelegate<M, any, any>[] = collection.subcollections?.map((subcollection) => {
                return {
                    id: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    Builder: ({ entity }) => (
                        <Button color={"primary"}
                                startIcon={<KeyboardTabIcon size={"small"}/>}
                                onClick={(event: any) => {
                                    event.stopPropagation();
                                    sideEntityController.open({
                                        path: fullPath,
                                        entityId: entity.id,
                                        selectedSubPath: subcollection.alias ?? subcollection.path,
                                        collection,
                                        updateUrl: true
                                    });
                                }}>
                            {subcollection.name}
                        </Button>
                    )
                };
            }) ?? [];

            const collectionGroupParentCollections: AdditionalFieldDelegate<M, any, any>[] = collection.collectionGroup
                ? [{
                    id: COLLECTION_GROUP_PARENT_ID,
                    name: "Parent entities",
                    width: 260,
                    dependencies: [],
                    Builder: ({ entity }) => {
                        const collectionsWithPath = navigation.getParentReferencesFromPath(entity.path);
                        return (
                            <>
                                {collectionsWithPath.map((reference) => {
                                    return (
                                        <ReferencePreview
                                            key={reference.path + "/" + reference.id}
                                            reference={reference}
                                            size={"tiny"}/>
                                    );
                                })}
                            </>
                        );
                    }
                }]
                : [];

            return [
                ...(collection.additionalFields ?? collection.additionalColumns ?? []),
                ...subcollectionColumns,
                ...collectionGroupParentCollections
            ];
        }, [collection, fullPath]);

        const tableRowActionsBuilder = useCallback(({
                                                        entity,
                                                        size,
                                                        width,
                                                        frozen
                                                    }: {
            entity: Entity<any>,
            size: CollectionSize,
            width: number,
            frozen?: boolean
        }) => {

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

        const title = <Popover
            open={popOverOpen}
            onOpenChange={setPopOverOpen}
            enabled={Boolean(collection.description)}
            trigger={<div className="flex flex-col items-start">
                <Typography
                    variant={"subtitle1"}
                    className={`leading-none truncate max-w-[160px] lg:max-w-[240px] ${collection.description ? "cursor-pointer" : "cursor-auto"}`}
                    onClick={collection.description
                        ? (e) => {
                            setPopOverOpen(true);
                            e.stopPropagation();
                        }
                        : undefined}
                >
                    {`${collection.name}`}
                </Typography>

                <EntitiesCount
                    fullPath={fullPath}
                    collection={collection}
                    filter={tableController.filterValues}
                    sortBy={tableController.sortBy}
                />

            </div>}
        >

            {collection.description && <div className="m-4 text-gray-900 dark:text-white">
                <Markdown source={collection.description}/>
            </div>}

        </Popover>;

        return (
            <div className={cn("overflow-hidden h-full w-full", className)}>
                <EntityCollectionTable
                    key={`collection_table_${fullPath}`}
                    additionalFields={additionalFields}
                    tableController={tableController}
                    displayedColumnIds={displayedColumnIds}
                    onSizeChanged={onSizeChanged}
                    onEntityClick={onEntityClick}
                    onColumnResize={onColumnResize}
                    onValueChange={onValueChange}
                    tableRowActionsBuilder={tableRowActionsBuilder}
                    uniqueFieldValidator={uniqueFieldValidator}
                    title={title}
                    selectionController={usedSelectionController}
                    highlightedEntities={selectedNavigationEntity ? [selectedNavigationEntity] : []}
                    defaultSize={collection.defaultSize}
                    properties={resolvedCollection.properties}
                    getPropertyFor={getPropertyFor}
                    actions={<EntityCollectionViewActions
                        parentPathSegments={parentPathSegments ?? []}
                        collection={collection}
                        tableController={tableController}
                        exportable={exportable}
                        onMultipleDeleteClick={onMultipleDeleteClick}
                        onNewClick={onNewClick}
                        path={fullPath}
                        relativePath={collection.path}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}
                    />}
                    hoverRow={hoverRow}
                    inlineEditing={checkInlineEditing()}
                />

                <PopupFormField
                    key={`popup_form_${popupCell?.columnIndex}_${popupCell?.entity?.id}`}
                    open={Boolean(popupCell)}
                    onClose={onPopupClose}
                    cellRect={popupCell?.cellRect}
                    columnIndex={popupCell?.columnIndex}
                    propertyKey={popupCell?.propertyKey}
                    collection={collection}
                    entity={popupCell?.entity}
                    tableKey={tableKey.current}
                    customFieldValidator={uniqueFieldValidator}
                    path={resolvedFullPath}
                    onCellValueChange={onValueChange}
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

            </div>
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

function EntitiesCount({
                           fullPath,
                           collection,
                           filter,
                           sortBy
                       }: {
    fullPath: string,
    collection: EntityCollection,
    filter?: FilterValues<any>,
    sortBy?: [string, "asc" | "desc"]
}) {

    const dataSource = useDataSource();
    const navigation = useNavigationContext();
    const [count, setCount] = useState<number | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;
    const resolvedPath = useMemo(() => navigation.resolveAliasesFrom(fullPath), [fullPath, navigation.resolveAliasesFrom]);

    useEffect(() => {
        dataSource.countEntities({
            path: resolvedPath,
            collection,
            filter,
            orderBy: sortByProperty,
            order: currentSort
        }).then(setCount).catch(setError);
    }, [fullPath, dataSource, resolvedPath, collection, filter, sortByProperty, currentSort]);

    if (error) {
        return null;
    }

    return <Typography
        className="w-full text-ellipsis block overflow-hidden whitespace-nowrap max-w-xs text-left w-fit-content"
        variant={"caption"}
        color={"secondary"}>
        {count !== undefined ? `${count} entities` : <Skeleton className={"w-full max-w-[80px] mt-1"}/>}
    </Typography>;
}

function buildPropertyWidthOverwrite(key: string, width: number): PartialEntityCollection {
    if (key.includes(".")) {
        const [parentKey, ...childKey] = key.split(".");
        return { properties: { [parentKey]: buildPropertyWidthOverwrite(childKey.join("."), width) } } as PartialEntityCollection;
    }
    return { properties: { [key]: { columnWidth: width } } } as PartialEntityCollection;
}


