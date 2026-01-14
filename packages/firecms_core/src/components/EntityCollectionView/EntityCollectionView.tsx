import React, { useCallback, useEffect, useMemo, useState } from "react";

import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityAction,
    EntityCollection,
    EntityReference,
    EntityTableController,
    FilterValues,
    PartialEntityCollection,
    PropertyOrBuilder,
    ResolvedProperty,
    SaveEntityProps,
    ViewMode
} from "../../types";
import {
    EntityCollectionRowActions,
    EntityCollectionTable,
    useDataSourceTableController
} from "../EntityCollectionTable";
import { CollectionTableToolbar } from "../EntityCollectionTable/internal/CollectionTableToolbar";

import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    getPropertyInPath,
    mergeDeep,
    mergeEntityActions,
    navigateToEntity,
    resolveCollection,
    resolveEntityAction,
    resolveProperty
} from "../../util";
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
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import { EntityCollectionCardView } from "./EntityCollectionCardView";
import {
    AddIcon,
    Button,
    cls,
    defaultBorderMixin,
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
    OnColumnResizeParams,
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

const DEFAULT_ENTITY_OPEN_MODE: "side_panel" | "full_screen" = "side_panel";

/**
 * @group Components
 */
export type EntityCollectionViewProps<M extends Record<string, any>> = {
    /**
     * Complete path where this collection is located.
     * It defaults to the collection path if not provided.
     */
    fullPath?: string;
    /**
     * Full path using navigation ids.
     */
    fullIdPath?: string;
    /**
     * If this is a subcollection, specify the parent collection ids.
     */
    parentCollectionIds?: string[];
    /**
     * Whether this is a subcollection or not.
     */
    isSubCollection?: boolean;

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
 * @param fullPath
 * @param collection

 * @group Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends Record<string, any>>({
        fullPath: fullPathProp,
        fullIdPath,
        parentCollectionIds,
        isSubCollection,
        className,
        updateUrl,
        ...collectionProp
    }: EntityCollectionViewProps<M>
    ) {

        const context = useFireCMSContext();
        const navigation = useNavigationController();
        const fullPath = fullPathProp ?? collectionProp.path;
        const dataSource = useDataSource(collectionProp);
        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const analyticsController = useAnalyticsController();
        const customizationController = useCustomizationController();

        const containerRef = React.useRef<HTMLDivElement>(null);

        const scrollRestoration = useScrollRestoration();

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(fullPath);
            return (userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp) as EntityCollection<M>;
        }, [collectionProp, fullPath, userConfigPersistence?.getCollectionConfig]);

        const openEntityMode = collection?.openEntityMode ?? DEFAULT_ENTITY_OPEN_MODE;

        const collectionRef = React.useRef(collection);
        useEffect(() => {
            collectionRef.current = collection;
        }, [collection]);

        const canCreateEntities = canCreateEntity(collection, authController, fullPath, null);
        const [highlightedEntity, setHighlightedEntity] = useState<Entity<M> | undefined>(undefined);
        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const [lastDeleteTimestamp, setLastDeleteTimestamp] = React.useState<number>(0);

        // number of entities in the collection
        const [docsCount, setDocsCount] = useState<number>(0);

        // Optimistic state for column order to prevent UI flickering during persistence
        const [localPropertiesOrder, setLocalPropertiesOrder] = useState<string[] | undefined>(collection.propertiesOrder);

        // Sync local state with collection's propertiesOrder when it changes from external sources
        useEffect(() => {
            setLocalPropertiesOrder(collection.propertiesOrder);
        }, [collection.propertiesOrder]);

        const unselectNavigatedEntity = useCallback(() => {
            const currentSelection = highlightedEntity;
            setTimeout(() => {
                if (currentSelection === highlightedEntity)
                    setHighlightedEntity(undefined);
            }, 2400);
        }, [highlightedEntity]);

        const checkInlineEditing = useCallback((entity?: Entity<any>): boolean => {
            const collection = collectionRef.current;
            if (!canEditEntity(collection, authController, fullPath, entity ?? null)) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [authController, fullPath]);

        const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
        const hoverRow = !checkInlineEditing();

        const [popOverOpen, setPopOverOpen] = useState(false);

        // View mode state - initialize from collection prop or user config
        const defaultViewMode = collection.defaultViewMode ?? "table";
        const [viewMode, setViewMode] = useState<ViewMode>(() => {
            const savedViewMode = userConfigPersistence?.getCollectionConfig<M>(fullPath)?.defaultViewMode;
            return (savedViewMode as ViewMode) ?? defaultViewMode;
        });

        // Card view size state - controls the grid column count
        const [cardSize, setCardSize] = useState<CollectionSize>(collection.defaultSize ?? "m");

        const selectionController = useSelectionController<M>();
        const usedSelectionController = collection.selectionController ?? selectionController;
        const {
            selectedEntities,
            setSelectedEntities
        } = usedSelectionController;

        const tableController = useDataSourceTableController<M>({
            fullPath,
            collection,
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

            if (collection) {
                addRecentId(collection.id, clickedEntity.id);
            }

            const path = collection?.collectionGroup ? clickedEntity.path : (fullPath ?? clickedEntity.path);
            navigateToEntity({
                navigation,
                path,
                fullIdPath,
                sideEntityController,
                openEntityMode,
                collection,
                entityId: clickedEntity.id
            });

        }, [unselectNavigatedEntity, sideEntityController]);

        const onNewClick = useCallback(() => {
            const collection = collectionRef.current;
            analyticsController.onAnalyticsEvent?.("new_entity_click", {
                path: fullPath
            });
            navigateToEntity({
                openEntityMode,
                collection,
                entityId: undefined,
                path: fullPath,
                fullIdPath,
                sideEntityController,
                navigation,
                onClose: unselectNavigatedEntity
            })
        }, [fullPath, sideEntityController]);

        const onMultipleDeleteClick = () => {
            analyticsController.onAnalyticsEvent?.("multiple_delete_dialog_open", {
                path: fullPath
            });
            setDeleteEntityClicked(selectedEntities);
        };

        const internalOnEntityDelete = (_path: string, entity: Entity<M>) => {
            analyticsController.onAnalyticsEvent?.("single_entity_deleted", {
                path: fullPath
            });
            setSelectedEntities((selectedEntities) => selectedEntities.filter((e) => e.id !== entity.id));
            setLastDeleteTimestamp(Date.now());
        };

        const internalOnMultipleEntitiesDelete = (_path: string, entities: Entity<M>[]) => {
            analyticsController.onAnalyticsEvent?.("multiple_entities_deleted", {
                path: fullPath
            });
            setSelectedEntities([]);
            setDeleteEntityClicked(undefined);
            setLastDeleteTimestamp(Date.now());
        };

        let AddColumnComponent: React.ComponentType<{
            fullPath: string,
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
            onCollectionModifiedForUser(fullPath, localCollection);
        }, [onCollectionModifiedForUser, fullPath]);

        const onSizeChanged = useCallback((size: CollectionSize) => {
            if (userConfigPersistence)
                onCollectionModifiedForUser(fullPath, { defaultSize: size })
        }, [onCollectionModifiedForUser, fullPath, userConfigPersistence]);

        const onViewModeChange = useCallback((mode: ViewMode) => {
            setViewMode(mode);
            if (userConfigPersistence) {
                onCollectionModifiedForUser(fullPath, { defaultViewMode: mode } as PartialEntityCollection<M>);
            }
        }, [fullPath, userConfigPersistence, onCollectionModifiedForUser]);

        const createEnabled = canCreateEntity(collection, authController, fullPath, null);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                name,
                value,
                property,
                entityId
            }) => dataSource.checkUniqueField(fullPath, name, value, entityId, collection),
            [fullPath]);

        const onValueChange: OnCellValueChange<any, any> = ({
            value,
            propertyKey,
            onValueUpdated,
            setError,
            data: entity,
        }) => {

            const updatedValues = setIn({ ...entity.values }, propertyKey, value);

            const saveProps: SaveEntityProps = {
                path: entity.path ?? fullPath,
                entityId: entity.id,
                values: updatedValues,
                previousValues: entity.values,
                collection,
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
                },
                onPreSaveHookError: (e: Error) => {
                    console.error("Pre-save hook error");
                    console.error(e);
                    setError(e);
                }
            });

        };

        const resolvedFullPath = navigation.resolveIdsFrom(fullPath);
        const resolvedCollection = useMemo(() => resolveCollection<M>({
            collection,
            path: fullPath,
            propertyConfigs: customizationController.propertyConfigs,
            authController,
        }), [collection, fullPath]);

        const getPropertyFor = useCallback(({
            propertyKey,
            entity
        }: GetPropertyForProps<M>) => {
            let propertyOrBuilder: PropertyOrBuilder<any, M> | undefined = getPropertyInPath<M>(collection.properties, propertyKey);

            // we might not find the property in the collection if combining property builders and map spread
            if (!propertyOrBuilder) {
                // these 2 properties are coming from the resolved collection with default values
                propertyOrBuilder = getPropertyInPath<M>(resolvedCollection.properties, propertyKey);
            }

            return resolveProperty({
                propertyKey,
                propertyOrBuilder,
                path: entity.path,
                values: entity.values,
                entityId: entity.id,
                propertyConfigs: customizationController.propertyConfigs,
                authController
            });
        }, [collection.properties, customizationController.propertyConfigs, resolvedCollection.properties]);

        // Use a collection with local propertiesOrder for optimistic UI updates
        const collectionWithLocalOrder = useMemo(() => {
            if (localPropertiesOrder && localPropertiesOrder !== resolvedCollection.propertiesOrder) {
                return { ...resolvedCollection, propertiesOrder: localPropertiesOrder };
            }
            return resolvedCollection;
        }, [resolvedCollection, localPropertiesOrder]);

        const displayedColumnIds = useColumnIds(collectionWithLocalOrder, true);

        const additionalFields = useMemo(() => {
            const subcollectionColumns: AdditionalFieldDelegate<M, any>[] = collection.subcollections?.map((subcollection) => {
                return {
                    key: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    Builder: ({ entity }) => (
                        <Button color={"primary"}
                            variant={"outlined"}
                            className={"max-w-full truncate justify-start"}
                            startIcon={<KeyboardTabIcon size={"small"} />}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                navigateToEntity({
                                    openEntityMode,
                                    collection,
                                    entityId: entity.id,
                                    selectedTab: subcollection.id ?? subcollection.path,
                                    path: fullPath,
                                    fullIdPath,
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
                                            size={"small"} />
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
        }, [collection, fullPath, sideEntityController]);

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
            const deleteEnabled = entity ? canDeleteEntity(collection, authController, fullPath, entity) : true;
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
                    fullPath={fullPath}
                    fullIdPath={fullIdPath}
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
                        : undefined}>
                    {`${collection.name}`}
                </Typography>

                <EntitiesCount
                    fullPath={fullPath}
                    collection={collection}
                    filter={tableController.filterValues}
                    sortBy={tableController.sortBy}
                    onCountChange={setDocsCount}
                />

            </div>}
        >

            {collection.description && <div className="m-4 text-surface-900 dark:text-white">
                <Markdown source={collection.description} />
            </div>}

        </Popover>;

        const buildAdditionalHeaderWidget = useCallback(({
            property,
            propertyKey,
            onHover
        }: {
            property: ResolvedProperty,
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
                            fullPath={fullPath}
                            collection={collection}
                            tableController={tableController}
                            parentCollectionIds={parentCollectionIds ?? []} />;
                    })}
            </>;
        }, [customizationController.plugins, fullPath, parentCollectionIds]);

        const addColumnComponentInternal = AddColumnComponent
            ? function () {
                if (typeof AddColumnComponent === "function")
                    return <AddColumnComponent fullPath={fullPath}
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController} />;
                return null;
            }
            : undefined;

        const {
            textSearchLoading,
            textSearchInitialised,
            onTextSearchClick,
            textSearchEnabled
        } = useTableSearchHelper({
            collection,
            fullPath: resolvedFullPath,
            parentCollectionIds
        });

        return (
            <div className={cls("overflow-hidden h-full w-full rounded-md flex flex-col", className)}
                ref={containerRef}>
{/* Common actions component used for both views */}
                {viewMode === "cards" ? (
                    <>
                        {/* Card View Toolbar - reusing CollectionTableToolbar */}
                        <CollectionTableToolbar
                            title={title}
                            loading={tableController.dataLoading}
                            size={cardSize}
                            onSizeChanged={setCardSize}
                            onTextSearch={textSearchEnabled && textSearchInitialised ? tableController.setSearchString : undefined}
                            onTextSearchClick={textSearchEnabled && !textSearchInitialised ? onTextSearchClick : undefined}
                            textSearchLoading={textSearchLoading}
                            actionsStart={<EntityCollectionViewStartActions
                                parentCollectionIds={parentCollectionIds ?? []}
                                collection={collection}
                                tableController={tableController}
                                path={fullPath}
                                relativePath={collection.path}
                                selectionController={usedSelectionController}
                                collectionEntitiesCount={docsCount}
                                resolvedProperties={resolvedCollection.properties} />}
                            actions={<EntityCollectionViewActions
                                parentCollectionIds={parentCollectionIds ?? []}
                                collection={collection}
                                tableController={tableController}
                                onMultipleDeleteClick={onMultipleDeleteClick}
                                onNewClick={onNewClick}
                                path={fullPath}
                                relativePath={collection.path}
                                selectionController={usedSelectionController}
                                selectionEnabled={selectionEnabled}
                                collectionEntitiesCount={docsCount}
                                viewMode={viewMode}
                                onViewModeChange={onViewModeChange}
                            />}
                        />
                        {/* Card Grid View */}
                        <EntityCollectionCardView
                            collection={collection}
                            tableController={tableController}
                            onEntityClick={onEntityClick}
                            selectionController={usedSelectionController}
                            selectionEnabled={selectionEnabled}
                            highlightedEntities={highlightedEntity ? [highlightedEntity] : []}
                            onScroll={tableController.onScroll}
                            initialScroll={tableController.initialScroll}
                            size={cardSize}
                            emptyComponent={canCreateEntities && tableController.filterValues === undefined && tableController.sortBy === undefined
                                ? <div className="flex flex-col items-center justify-center">
                                    <Typography variant={"subtitle2"}>So empty...</Typography>
                                    <Button
                                        color={"primary"}
                                        variant={"outlined"}
                                        onClick={onNewClick}
                                        className="mt-4"
                                    >
                                        <AddIcon />
                                        Create your first entry
                                    </Button>
                                </div>
                                : <Typography variant={"label"}>No results with the applied filter/sort</Typography>
                            }
                        />
                    </>
                ) : (                <EntityCollectionTable
                    key={`collection_table_${fullPath}`}
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
                    highlightedEntities={highlightedEntity ? [highlightedEntity] : []}
                    defaultSize={collection.defaultSize}
                    properties={resolvedCollection.properties}
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
                        path={fullPath}
                        relativePath={collection.path}
                        selectionController={usedSelectionController}
                        collectionEntitiesCount={docsCount} resolvedProperties={resolvedCollection.properties} />}
                        actions={<EntityCollectionViewActions
                            parentCollectionIds={parentCollectionIds ?? []}
                            collection={collection}
                            tableController={tableController}
                            onMultipleDeleteClick={onMultipleDeleteClick}
                            onNewClick={onNewClick}
                            path={fullPath}
                            relativePath={collection.path}
                            selectionController={usedSelectionController}
                            selectionEnabled={selectionEnabled}
                            collectionEntitiesCount={docsCount}
                            viewMode={viewMode}
                            onViewModeChange={onViewModeChange}/>}
                    emptyComponent={canCreateEntities && tableController.filterValues === undefined && tableController.sortBy === undefined
                        ? <div className="flex flex-col items-center justify-center">
                            <Typography variant={"subtitle2"}>So empty...</Typography>
                            <Button
                                color={"primary"}
                                variant={"outlined"}
                                onClick={onNewClick}
                                className="mt-4"
                            >
                                <AddIcon />
                                Create your first entry
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
                        path={fullPath}
                        fullIdPath={fullIdPath ?? fullPath}
                        collection={collection} />}
                    openEntityMode={openEntityMode}
                    onColumnsOrderChange={(newColumns) => {
                        // Extract property keys from the new column order
                        // Filter to only include actual property columns (not frozen columns, not additional fields, etc.)
                        const newPropertiesOrder = newColumns
                            .filter(col => !col.frozen && getPropertyInPath(collection.properties, col.key))
                            .map(col => col.key);

                        // Optimistically update local state to prevent UI flickering
                        setLocalPropertiesOrder(newPropertiesOrder);

                        // Call each plugin's onColumnsReorder callback
                        if (customizationController?.plugins) {
                            customizationController.plugins
                                .filter(plugin => plugin.collectionView?.onColumnsReorder)
                                .forEach(plugin => {
                                    plugin.collectionView!.onColumnsReorder!({
                                        fullPath,
                                        parentCollectionIds: parentCollectionIds ?? [],
                                        collection,
                                        newPropertiesOrder
                                    });
                                });
                        }
                    }}
                />)}

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
                    container={containerRef.current} />}

                {deleteEntityClicked &&
                    <DeleteEntityDialog
                        entityOrEntitiesToDelete={deleteEntityClicked}
                        path={fullPath}
                        collection={collection}
                        callbacks={collection.callbacks}
                        open={Boolean(deleteEntityClicked)}
                        onEntityDelete={internalOnEntityDelete}
                        onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                        onClose={() => setDeleteEntityClicked(undefined)} />}

            </div>
        );
    }, (a, b) => {
        return equal(a.path, b.path) &&
            equal(a.parentCollectionIds, b.parentCollectionIds) &&
            equal(a.isSubCollection, b.isSubCollection) &&
            equal(a.className, b.className) &&
            equal(a.properties, b.properties) &&
            equal(a.propertiesOrder, b.propertiesOrder) &&
            equal(a.hideIdFromCollection, b.hideIdFromCollection) &&
            equal(a.inlineEditing, b.inlineEditing) &&
            equal(a.selectionEnabled, b.selectionEnabled) &&
            equal(a.selectionController, b.selectionController) &&
            equal(a.Actions, b.Actions) &&
            equal(a.defaultSize, b.defaultSize) &&
            equal(a.initialFilter, b.initialFilter) &&
            equal(a.initialSort, b.initialSort) &&
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
    fullPath,
    collection,
    filter,
    sortBy,
    onCountChange
}: {
    fullPath: string,
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
    const resolvedPath = useMemo(() => navigation.resolveIdsFrom(fullPath), [fullPath, navigation.resolveIdsFrom]);

    useEffect(() => {
        if (dataSource.countEntities)
            dataSource.countEntities({
                path: resolvedPath,
                collection,
                filter,
                orderBy: sortByProperty,
                order: currentSort
            }).then(setCount).catch(setError);
    }, [fullPath, dataSource.countEntities, resolvedPath, collection, filter, sortByProperty, currentSort]);

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
        {count !== undefined ? `${count} entities` : <Skeleton className={"w-full max-w-[80px] mt-1"} />}
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
    fullIdPath
}: {
    collection: EntityCollection,
    path: string,
    fullIdPath: string
}) {

    const navigation = useNavigationController();
    const [openPopup, setOpenPopup] = React.useState(false);
    const [searchString, setSearchString] = React.useState("");
    const [recentIds, setRecentIds] = React.useState<string[]>(getRecentIds(collection.id));
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
                        <SearchIcon size={"small"} />
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
                            setRecentIds(addRecentId(collection.id, entityId));
                            navigateToEntity({
                                openEntityMode,
                                collection,
                                entityId,
                                path,
                                fullIdPath,
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
                                className={"rounded-lg bg-white dark:bg-surface-800 flex-grow bg-transparent outline-none p-2 " + focusedDisabled} />
                            <Button variant={"text"}
                                disabled={!(searchString.trim())}
                                type={"submit"}
                            ><KeyboardTabIcon /></Button>
                        </div>
                    </form>
                    {recentIds && recentIds.length > 0 && <div className="flex flex-col gap-2 p-2">
                        {recentIds.map(id => (
                            <ReferencePreview reference={new EntityReference(id, path)}
                                key={id}
                                hover={true}
                                onClick={() => {
                                    setOpenPopup(false);
                                    navigateToEntity({
                                        openEntityMode,
                                        collection,
                                        entityId: id,
                                        path,
                                        fullIdPath,
                                        sideEntityController,
                                        navigation
                                    })
                                }}
                                includeEntityLink={false}
                                size={"small"} />
                        ))}
                    </div>}
                </div>
            </Popover>

        </Tooltip>
    );
}
