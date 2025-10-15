import React, { useCallback, useEffect, useMemo, useState } from "react";

import { deepEqual as equal } from "fast-equals"

import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityAction,
    EntityCollection,
    EntityTableController,
    FilterValues,
    PartialEntityCollection,
    Property,
    SaveEntityProps
} from "@firecms/types";
import {
    EntityCollectionRowActions,
    EntityCollectionTable,
    useDataSourceTableController
} from "../EntityCollectionTable";

import { getPropertyInPath } from "../../util";
import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    getSubcollections,
    mergeDeep,
    mergeEntityActions,
    navigateToEntity,
    resolveEntityAction
} from "@firecms/common";
import { ReferencePreview } from "../../preview";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useLargeLayout,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import {
    AddIcon,
    Button,
    cls,
    focusedDisabled,
    IconButton,
    KeyboardTabIcon,
    Markdown,
    Popover,
    SearchIcon,
    Skeleton,
    Tooltip,
    Typography
} from "@firecms/ui";
import { setIn } from "@firecms/formex";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import {
    COLLECTION_GROUP_PARENT_ID,
    copyEntityAction,
    deleteEntityAction,
    editEntityAction,
    OnCellValueChange,
    UniqueFieldValidator,
    useColumnIds,
    useTableSearchHelper
} from "../common";
import { PopupFormField } from "../EntityCollectionTable/internal/popup_field/PopupFormField";
import { GetPropertyForProps } from "../EntityCollectionTable/EntityCollectionTableProps";
import { DeleteEntityDialog } from "../DeleteEntityDialog";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";
import { useSelectionController } from "./useSelectionController";
import { EntityCollectionViewStartActions } from "./EntityCollectionViewStartActions";
import { addRecentId, getRecentIds } from "./utils";
import { useScrollRestoration } from "../common/useScrollRestoration";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import { OnColumnResizeParams } from "../common/types";
import { EntityPreviewWithId } from "../EntityPreview";

const DEFAULT_ENTITY_OPEN_MODE: "side_panel" | "full_screen" = "side_panel";

/**
 * @group Components
 */
export type EntityCollectionViewProps<M extends Record<string, any>> = {
    /**
     * Complete CMS path where this collection is located.
     */
    path?: string;
    /**
     * If this is a subcollection, specify the parent collection ids.
     */
    parentCollectionIds?: string[];

    className?: string;

    /**
     * If true, this view will store its filter and sorting status in the url params
     */
    updateUrl?: boolean;

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
 * @param path
 * @param collection

 * @group Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends Record<string, any>>({
                                                                     path: fullPathProp,
                                                                     parentCollectionIds,
                                                                     className,
                                                                     updateUrl,
                                                                     ...collectionProp
                                                                 }: EntityCollectionViewProps<M>
    ) {

        const context = useFireCMSContext();
        const navigation = useNavigationController();
        const path = fullPathProp ?? collectionProp.slug;
        const dataSource = useDataSource(collectionProp);
        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const analyticsController = useAnalyticsController();
        const customizationController = useCustomizationController();

        const containerRef = React.useRef<HTMLDivElement>(null);

        const scrollRestoration = useScrollRestoration();

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(path);
            return (userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp) as EntityCollection<M>;
        }, [collectionProp, path, userConfigPersistence?.getCollectionConfig]);

        const openEntityMode = collection?.openEntityMode ?? DEFAULT_ENTITY_OPEN_MODE;

        const collectionRef = React.useRef(collection);
        useEffect(() => {
            collectionRef.current = collection;
        }, [collection]);

        const canCreateEntities = canCreateEntity(collection, authController, path, null);
        const [highlightedEntity, setHighlightedEntity] = useState<Entity<M> | undefined>(undefined);
        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const [lastDeleteTimestamp, setLastDeleteTimestamp] = React.useState<number>(0);

        // number of entities in the collection
        const [docsCount, setDocsCount] = useState<number>(0);

        const unselectNavigatedEntity = useCallback(() => {
            const currentSelection = highlightedEntity;
            setTimeout(() => {
                if (currentSelection === highlightedEntity)
                    setHighlightedEntity(undefined);
            }, 2400);
        }, [highlightedEntity]);

        const checkInlineEditing = useCallback((entity?: Entity<any>): boolean => {
            const collection = collectionRef.current;
            if (!canEditEntity(collection, authController, path, entity ?? null)) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [authController, path]);

        const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
        const hoverRow = !checkInlineEditing();

        const [popOverOpen, setPopOverOpen] = useState(false);

        const selectionController = useSelectionController<M>();
        const usedSelectionController = collection.selectionController ?? selectionController;
        const {
            selectedEntities,
            setSelectedEntities
        } = usedSelectionController;

        const tableController = useDataSourceTableController<M>({
            path,
            collection: collection,
            lastDeleteTimestamp,
            scrollRestoration,
            updateUrl
        });

        const tableKey = React.useRef<string>(Math.random().toString(36));
        const popupCell = tableController.popupCell;

        const onPopupClose = useCallback(() => {
            tableController.setPopupCell?.(undefined);
        }, [tableController.setPopupCell]);

        const onEntityClick = useCallback((clickedEntity: Entity<M>) => {
            const collection = collectionRef.current;
            setHighlightedEntity(clickedEntity);
            analyticsController.onAnalyticsEvent?.("edit_entity_clicked", {
                path: clickedEntity.path,
                entityId: clickedEntity.id
            });

            if (collectionRef.current) {
                addRecentId(collectionRef.current.slug, clickedEntity.id);
            }

            const usedPath = collectionRef.current?.collectionGroup ? clickedEntity.path : (path ?? clickedEntity.path);
            navigateToEntity({
                navigation,
                path: usedPath,
                sideEntityController,
                openEntityMode,
                collection,
                entityId: clickedEntity.id
            });

        }, [unselectNavigatedEntity, sideEntityController]);

        const onNewClick = useCallback(() => {
            const collection = collectionRef.current;
            analyticsController.onAnalyticsEvent?.("new_entity_click", {
                path
            });
            navigateToEntity({
                openEntityMode,
                collection,
                entityId: undefined,
                path,
                sideEntityController,
                navigation,
                onClose: unselectNavigatedEntity
            })
        }, [path, sideEntityController]);

        const onMultipleDeleteClick = () => {
            analyticsController.onAnalyticsEvent?.("multiple_delete_dialog_open", {
                path
            });
            setDeleteEntityClicked(selectedEntities);
        };

        const internalOnEntityDelete = (_path: string, entity: Entity<M>) => {
            analyticsController.onAnalyticsEvent?.("single_entity_deleted", {
                path
            });
            setSelectedEntities((selectedEntities) => selectedEntities.filter((e) => e.id !== entity.id));
            setLastDeleteTimestamp(Date.now());
        };

        const internalOnMultipleEntitiesDelete = (_path: string, entities: Entity<M>[]) => {
            analyticsController.onAnalyticsEvent?.("multiple_entities_deleted", {
                path
            });
            setSelectedEntities([]);
            setDeleteEntityClicked(undefined);
            setLastDeleteTimestamp(Date.now());
        };

        let AddColumnComponent: React.ComponentType<{
            path: string,
            parentCollectionIds: string[],
            collection: EntityCollection;
            tableController: EntityTableController;
        }> | undefined

        // we are only using the first plugin that implements this
        if (customizationController?.plugins) {
            AddColumnComponent = customizationController.plugins.find(plugin => plugin.collectionView?.AddColumnComponent)?.collectionView?.AddColumnComponent;
        }

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

            const collection = collectionRef.current;
            // Only for property columns
            if (!getPropertyInPath(collection.properties, key)) return;
            const localCollection = buildPropertyWidthOverwrite(key, width);
            onCollectionModifiedForUser(path, localCollection);
        }, [onCollectionModifiedForUser, path]);

        const onSizeChanged = useCallback((size: CollectionSize) => {
            if (userConfigPersistence)
                onCollectionModifiedForUser(path, { defaultSize: size })
        }, [onCollectionModifiedForUser, path, userConfigPersistence]);

        const createEnabled = canCreateEntity(collection, authController, path, null);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                 name,
                 value,
                 property,
                 entityId
             }) => dataSource.checkUniqueField(path, name, value, entityId, collection),
            [path]);

        const onValueChange: OnCellValueChange<any, any> = ({
                                                                value,
                                                                propertyKey,
                                                                onValueUpdated,
                                                                setError,
                                                                data: entity,
                                                            }) => {

            const updatedValues = setIn({ ...entity.values }, propertyKey, value);

            const saveProps: SaveEntityProps = {
                path: entity.slug ?? path,
                entityId: entity.id,
                values: updatedValues,
                previousValues: entity.values,
                collection: collection,
                status: "existing"
            };

            return saveEntityWithCallbacks({
                ...saveProps,
                collection,
                dataSource,
                context,
                onSaveSuccess: () => {
                    setError(undefined);
                    onValueUpdated();
                },
                onSaveFailure: (e: Error) => {
                    console.error("Save failure");
                    console.error(e);
                    setError(e);
                }
            });

        };

        const resolvedFullPath = navigation.resolveDatabasePathsFrom(path);

        const getPropertyFor = useCallback(({
                                                propertyKey,
                                                entity
                                            }: GetPropertyForProps<M>) => {
            let property: Property | undefined = getPropertyInPath(collection.properties, propertyKey);

            // we might not find the property in the collection if combining property builders and map spread
            if (!property) {
                property = getPropertyInPath(collection.properties, propertyKey);
            }
            if (!property)
                throw Error(`Property ${propertyKey} not found in collection ${collection.slug}`);

            return property;
        }, [customizationController.propertyConfigs, collection.properties]);

        const displayedColumnIds = useColumnIds(collection, true);
        const subcollections = getSubcollections(collection);

        const additionalFields = useMemo(() => {
            const subcollectionColumns: AdditionalFieldDelegate<M, any>[] = subcollections.map((subcollection) => {
                return {
                    key: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    Builder: ({ entity }) => (
                        <Button color={"neutral"}
                                variant={"filled"}
                                className={"max-w-full truncate justify-start"}
                                startIcon={<KeyboardTabIcon size={"small"}/>}
                                onClick={(event: any) => {
                                    event.stopPropagation();
                                    navigateToEntity({
                                        openEntityMode,
                                        collection: collection,
                                        entityId: entity.id,
                                        selectedTab: subcollection.slug,
                                        path,
                                        navigation,
                                        sideEntityController
                                    })
                                }}>
                            {subcollection.name}
                        </Button>
                    )
                };
            }) ?? [];

            const collectionGroupParentCollections: AdditionalFieldDelegate<M, any>[] = collection.collectionGroup
                ? [{
                    key: COLLECTION_GROUP_PARENT_ID,
                    name: "Parent entities",
                    width: 260,
                    dependencies: [],
                    Builder: ({ entity }) => {
                        const collectionsWithPath = navigation.getParentReferencesFromPath(entity.path);
                        return (
                            <div className={"flex flex-col gap-2 w-full"}>
                                {collectionsWithPath.map((reference) => {
                                    return (
                                        <ReferencePreview
                                            key={reference.path + "/" + reference.id}
                                            reference={reference}
                                            size={"small"}/>
                                    );
                                })}
                            </div>
                        );
                    }
                }]
                : [];

            return [
                ...(collection.additionalFields ?? []),
                ...subcollectionColumns,
                ...collectionGroupParentCollections
            ];
        }, [collection, path, sideEntityController]);

        const updateLastDeleteTimestamp = useCallback(() => {
            setLastDeleteTimestamp(Date.now());
        }, []);

        const largeLayout = useLargeLayout();

        const getActionsForEntity = ({
                                         entity,
                                         customEntityActions
                                     }: {
            entity?: Entity<M>,
            customEntityActions?: EntityAction[]
        }): EntityAction[] => {
            const deleteEnabled = entity ? canDeleteEntity(collection, authController, path, entity) : true;
            const actions: EntityAction[] = [editEntityAction];
            if (createEnabled)
                actions.push(copyEntityAction);
            if (deleteEnabled)
                actions.push(deleteEntityAction);
            if (customEntityActions)
                return mergeEntityActions(actions, customEntityActions);
            return actions;
        };

        const getIdColumnWidth = () => {
            const entityActions = getActionsForEntity({});
            const collapsedActions = entityActions.filter(a => a.collapsed !== false);
            const uncollapsedActions = entityActions.filter(a => a.collapsed === false);
            const actionsWidth = uncollapsedActions.length * (largeLayout ? 40 : 30);
            return (largeLayout ? (80 + actionsWidth) : (70 + actionsWidth)) + (collapsedActions.length > 0 ? (largeLayout ? 40 : 30) : 0);
        };

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

            const isSelected = Boolean(usedSelectionController.selectedEntities.find(e => e.id == entity.id && e.path == entity.path));
            const customEntityActions = (collection.entityActions ?? [])
                .map(action => resolveEntityAction(action, customizationController.entityActions))
                .filter(Boolean) as EntityAction[];

            const actions = getActionsForEntity({
                entity,
                customEntityActions
            });

            return (
                <EntityCollectionRowActions
                    entity={entity}
                    width={width}
                    frozen={frozen}
                    isSelected={isSelected}
                    selectionEnabled={selectionEnabled}
                    size={size}
                    highlightEntity={setHighlightedEntity}
                    unhighlightEntity={unselectNavigatedEntity}
                    collection={collection}
                    path={path}
                    actions={actions}
                    hideId={collection?.hideIdFromCollection}
                    onCollectionChange={updateLastDeleteTimestamp}
                    selectionController={usedSelectionController}
                    openEntityMode={openEntityMode}
                />
            );

        }, [updateLastDeleteTimestamp, usedSelectionController]);

        const title = <Popover
            open={popOverOpen}
            onOpenChange={(open) => setPopOverOpen(open)}
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
                        : undefined}>
                    {`${collection.name}`}
                </Typography>

                <EntitiesCount
                    path={path}
                    collection={collection}
                    filter={tableController.filterValues}
                    sortBy={tableController.sortBy}
                    onCountChange={setDocsCount}
                />

            </div>}
        >

            {collection.description && <div className="m-4 text-surface-900 dark:text-white">
                <Markdown source={collection.description}/>
            </div>}

        </Popover>;

        const buildAdditionalHeaderWidget = useCallback(({
                                                             property,
                                                             propertyKey,
                                                             onHover
                                                         }: {
            property: Property,
            propertyKey: string,
            onHover: boolean
        }) => {
            const collection = collectionRef.current;
            if (!customizationController.plugins)
                return null;
            return <>
                {customizationController.plugins.filter(plugin => plugin.collectionView?.HeaderAction)
                    .map((plugin, i) => {
                        const HeaderAction = plugin.collectionView!.HeaderAction!;
                        return <HeaderAction
                            onHover={onHover}
                            key={`plugin_header_action_${i}`}
                            propertyKey={propertyKey}
                            property={property}
                            path={path}
                            collection={collection}
                            tableController={tableController}
                            parentCollectionIds={parentCollectionIds ?? []}/>;
                    })}
            </>;
        }, [customizationController.plugins, path, parentCollectionIds]);

        const addColumnComponentInternal = AddColumnComponent
            ? function () {
                if (typeof AddColumnComponent === "function")
                    return <AddColumnComponent path={path}
                                               parentCollectionIds={parentCollectionIds ?? []}
                                               collection={collection}
                                               tableController={tableController}/>;
                return null;
            }
            : undefined;

        const {
            textSearchLoading,
            textSearchInitialised,
            onTextSearchClick,
            textSearchEnabled
        } = useTableSearchHelper({
            collection: collection,
            path: resolvedFullPath,
            parentCollectionIds
        });

        return (
            <div className={cls("overflow-hidden h-full w-full rounded-md", className)}
                 ref={containerRef}>
                <EntityCollectionTable
                    key={`collection_table_${path}`}
                    additionalFields={additionalFields}
                    tableController={tableController}
                    enablePopupIcon={true}
                    displayedColumnIds={displayedColumnIds}
                    onSizeChanged={onSizeChanged}
                    onEntityClick={onEntityClick}
                    onColumnResize={onColumnResize}
                    onValueChange={onValueChange}
                    tableRowActionsBuilder={tableRowActionsBuilder}
                    uniqueFieldValidator={uniqueFieldValidator}
                    title={title}
                    selectionController={usedSelectionController}
                    defaultSize={collection.defaultSize}
                    properties={collection.properties}
                    getPropertyFor={getPropertyFor}
                    onTextSearchClick={textSearchInitialised ? undefined : onTextSearchClick}
                    onScroll={tableController.onScroll}
                    initialScroll={tableController.initialScroll}
                    textSearchLoading={textSearchLoading}
                    textSearchEnabled={textSearchEnabled}
                    actionsStart={<EntityCollectionViewStartActions
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController}
                        path={path}
                        relativePath={collection.slug}
                        selectionController={usedSelectionController}
                        collectionEntitiesCount={docsCount}/>}
                    actions={<EntityCollectionViewActions
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController}
                        onMultipleDeleteClick={onMultipleDeleteClick}
                        onNewClick={onNewClick}
                        path={path}
                        relativePath={collection.slug}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}
                        collectionEntitiesCount={docsCount}
                    />}
                    emptyComponent={canCreateEntities && tableController.filterValues === undefined && tableController.sortBy === undefined
                        ? <div className="flex flex-col items-center justify-center">
                            <Typography variant={"subtitle2"}>So empty...</Typography>
                            <Button
                                color={"primary"}
                                variant={"outlined"}
                                onClick={onNewClick}
                                className="mt-4"
                            >
                                <AddIcon/>
                                Create your first entity
                            </Button>
                        </div>
                        : <Typography variant={"label"}>No results with the applied filter/sort</Typography>
                    }
                    hoverRow={hoverRow}
                    inlineEditing={checkInlineEditing()}
                    AdditionalHeaderWidget={buildAdditionalHeaderWidget}
                    AddColumnComponent={addColumnComponentInternal}
                    getIdColumnWidth={getIdColumnWidth}
                    additionalIDHeaderWidget={<EntityIdHeaderWidget
                        path={path}
                        collection={collection}/>}
                    openEntityMode={openEntityMode}
                />

                {popupCell && <PopupFormField
                    key={`popup_form_${popupCell?.propertyKey}_${popupCell?.entityId}`}
                    open={Boolean(popupCell)}
                    onClose={onPopupClose}
                    cellRect={popupCell?.cellRect}
                    propertyKey={popupCell?.propertyKey}
                    collection={collection}
                    entityId={popupCell.entityId}
                    tableKey={tableKey.current}
                    customFieldValidator={uniqueFieldValidator}
                    path={resolvedFullPath}
                    onCellValueChange={onValueChange}
                    container={containerRef.current}/>}

                {deleteEntityClicked &&
                    <DeleteEntityDialog
                        entityOrEntitiesToDelete={deleteEntityClicked}
                        path={path}
                        collection={collection}
                        callbacks={collection.callbacks}
                        open={Boolean(deleteEntityClicked)}
                        onEntityDelete={internalOnEntityDelete}
                        onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                        onClose={() => setDeleteEntityClicked(undefined)}/>}

            </div>
        );
    }, (a, b) => {
        return equal(a.slug, b.slug) &&
            equal(a.parentCollectionIds, b.parentCollectionIds) &&
            equal(a.className, b.className) &&
            equal(a.properties, b.properties) &&
            equal(a.propertiesOrder, b.propertiesOrder) &&
            equal(a.hideIdFromCollection, b.hideIdFromCollection) &&
            equal(a.inlineEditing, b.inlineEditing) &&
            equal(a.selectionEnabled, b.selectionEnabled) &&
            equal(a.selectionController, b.selectionController) &&
            equal(a.Actions, b.Actions) &&
            equal(a.defaultSize, b.defaultSize) &&
            equal(a.filter, b.filter) &&
            equal(a.sort, b.sort) &&
            equal(a.includeJsonView, b.includeJsonView) &&
            equal(a.textSearchEnabled, b.textSearchEnabled) &&
            equal(a.additionalFields, b.additionalFields) &&
            equal(a.sideDialogWidth, b.sideDialogWidth) &&
            equal(a.openEntityMode, b.openEntityMode) &&
            equal(a.exportable, b.exportable) &&
            equal(a.history, b.history) &&
            equal(a.forceFilter, b.forceFilter);
    }) as React.FunctionComponent<EntityCollectionViewProps<any>>

function EntitiesCount({
                           path,
                           collection,
                           filter,
                           sortBy,
                           onCountChange
                       }: {
    path: string,
    collection: EntityCollection,
    filter?: FilterValues<any>,
    sortBy?: [string, "asc" | "desc"],
    onCountChange?: (count: number) => void,
}) {

    const dataSource = useDataSource(collection);
    const navigation = useNavigationController();
    const [count, setCount] = useState<number | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;
    const resolvedPath = useMemo(() => navigation.resolveDatabasePathsFrom(path), [path, navigation.resolveDatabasePathsFrom]);

    useEffect(() => {
        if (dataSource.countEntities)
            dataSource.countEntities({
                path: resolvedPath,
                collection,
                filter,
                orderBy: sortByProperty,
                order: currentSort
            }).then(setCount).catch(setError);
    }, [resolvedPath, filter, sortByProperty, currentSort]);

    useEffect(() => {
        if (onCountChange) {
            setError(undefined);
            onCountChange(count ?? 0);
        }
    }, [onCountChange, count]);

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

function EntityIdHeaderWidget({
                                  collection,
                                  path,
                              }: {
    collection: EntityCollection,
    path: string,
}) {

    const navigation = useNavigationController();
    const [openPopup, setOpenPopup] = React.useState(false);
    const [searchString, setSearchString] = React.useState("");
    const [recentIds, setRecentIds] = React.useState<(string | number)[]>(getRecentIds(collection.slug));
    const sideEntityController = useSideEntityController();

    const openEntityMode = collection?.openEntityMode ?? DEFAULT_ENTITY_OPEN_MODE;

    return (
        <Tooltip title={!openPopup ? "Find by ID" : undefined} asChild={false}>
            <Popover
                open={openPopup}
                onOpenChange={setOpenPopup}
                sideOffset={0}
                align={"start"}
                alignOffset={-117}
                trigger={
                    <IconButton size={"small"}>
                        <SearchIcon size={"small"}/>
                    </IconButton>
                }>
                <div
                    className={cls("my-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white")}>
                    <form noValidate={true}
                          onSubmit={(e) => {
                              e.preventDefault();
                              if (!searchString) return;
                              setOpenPopup(false);
                              const entityId = searchString.trim();
                              setRecentIds(addRecentId(collection.slug, entityId));
                              navigateToEntity({
                                  openEntityMode,
                                  collection,
                                  entityId,
                                  path,
                                  sideEntityController,
                                  navigation
                              })
                          }}
                          className={"w-96 max-w-full"}>

                        <div className="flex p-2 w-full gap-2">
                            <input
                                autoFocus={openPopup}
                                placeholder={"Find entity by ID"}
                                // size={"small"}
                                onChange={(e) => {
                                    setSearchString(e.target.value);
                                }}
                                value={searchString}
                                className={"rounded-lg bg-white dark:bg-surface-800 grow bg-transparent outline-hidden p-2 " + focusedDisabled}/>
                            <Button variant={"text"}
                                    disabled={!(searchString.trim())}
                                    type={"submit"}
                            ><KeyboardTabIcon/></Button>
                        </div>
                    </form>
                    {recentIds && recentIds.length > 0 && <div className="flex flex-col gap-2 p-2">
                        {recentIds.map(id => (
                            <EntityPreviewWithId entityId={id}
                                                 path={path}
                                                 key={id}
                                                 hover={true}
                                                 onClick={() => {
                                                     setOpenPopup(false);
                                                     navigateToEntity({
                                                         openEntityMode,
                                                         collection,
                                                         entityId: id,
                                                         path,
                                                         sideEntityController,
                                                         navigation
                                                     })
                                                 }}
                                                 includeEntityLink={false}
                                                 size={"small"}/>
                        ))}
                    </div>}
                </div>
            </Popover>

        </Tooltip>
    );
}
