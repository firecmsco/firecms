import React, { useCallback, useEffect, useMemo, useState } from "react";

import { deepEqual as equal } from "fast-equals"

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
    Property,
    SaveEntityProps,
    ViewMode
} from "@firecms/types";
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
    getSubcollections,
    mergeDeep,
    mergeEntityActions,
    navigateToEntity,
    resolveEntityAction
} from "@firecms/common";
import { getPropertyInPath } from "../../util";
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
import { useBreadcrumbsController } from "../../hooks/useBreadcrumbsController";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import { EntityCollectionCardView } from "./EntityCollectionCardView";
import { EntityCollectionBoardView } from "./EntityCollectionBoardView";
import { ViewModeToggle, KanbanPropertyOption } from "./ViewModeToggle";
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
    path?: string;
    /**
     * Full path using navigation ids.
     */
    idPath?: string;
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
 * @param path
 * @param collection

 * @group Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends Record<string, any>>({
        path: pathProp,

        parentCollectionIds,
        isSubCollection,
        className,
        updateUrl,
        ...collectionProp
    }: EntityCollectionViewProps<M>
    ) {

        const context = useFireCMSContext();
        const navigation = useNavigationController();
        const breadcrumbs = useBreadcrumbsController();
        const path = pathProp ?? collectionProp.dbPath;
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

        // Track recently deleted entities for optimistic Kanban count updates
        const [deletedEntities, setDeletedEntities] = React.useState<Entity<M>[]>([]);

        // number of entities in the collection (undefined = loading)
        const [docsCount, setDocsCount] = useState<number | undefined>(undefined);

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
            if (!canEditEntity(collection, authController, path, entity ?? null)) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [authController, path]);

        const selectionEnabled = collection.selectionEnabled === undefined || collection.selectionEnabled;
        const hoverRow = !checkInlineEditing();

        const [popOverOpen, setPopOverOpen] = useState(false);

        // View mode priority: URL > saved user config > collection.defaultViewMode
        const defaultViewMode = collection.defaultViewMode ?? "table";

        // Parse view from URL
        const getViewFromUrl = useCallback((): ViewMode | null => {
            const params = new URLSearchParams(window.location.search);
            const urlView = params.get("__view");
            if (urlView && ["table", "kanban", "cards"].includes(urlView)) {
                return urlView as ViewMode;
            }
            return null;
        }, []);

        // Get saved view from local persistence
        const getSavedView = useCallback((): ViewMode | null => {
            const saved = userConfigPersistence?.getCollectionConfig<M>(path)?.defaultViewMode;
            return (saved as ViewMode) ?? null;
        }, [userConfigPersistence, path]);

        const [viewMode, setViewModeState] = useState<ViewMode>(() => {
            // Priority: URL > saved config > collection default
            const urlView = getViewFromUrl();
            if (urlView) return urlView;
            const savedView = getSavedView();
            if (savedView) return savedView;
            return defaultViewMode;
        });

        // Sync URL with current view on init (if view came from saved config)
        useEffect(() => {
            const urlView = getViewFromUrl();
            if (!urlView && viewMode !== "table") {
                // View came from saved config but URL doesn't have it - update URL without push
                const url = new URL(window.location.href);
                url.searchParams.set("__view", viewMode);
                window.history.replaceState({}, "", url.toString());
            }
        }, []); // Only on mount

        // Update URL when view mode changes (user action)
        const setViewMode = useCallback((newMode: ViewMode) => {
            setViewModeState(newMode);

            // Update URL with __view param
            const url = new URL(window.location.href);
            if (newMode === "table") {
                url.searchParams.delete("__view");
            } else {
                url.searchParams.set("__view", newMode);
            }
            window.history.pushState({}, "", url.toString());
        }, []);

        // Listen for browser back/forward
        useEffect(() => {
            const handlePopState = () => {
                const urlView = getViewFromUrl();
                if (urlView) {
                    // URL has explicit view - use it
                    setViewModeState(urlView);
                } else {
                    // No URL param - fallback to saved config or collection default
                    const savedView = getSavedView();
                    setViewModeState(savedView ?? defaultViewMode);
                }
            };

            window.addEventListener("popstate", handlePopState);
            return () => window.removeEventListener("popstate", handlePopState);
        }, [getViewFromUrl, getSavedView, defaultViewMode]);

        // Card view size state - controls the grid column count
        const [cardSize, setCardSize] = useState<CollectionSize>(collection.defaultSize ?? "m");

        // Table view size state - controls row height
        const [tableSize, setTableSize] = useState<CollectionSize>(collection.defaultSize ?? "m");

        const selectionController = useSelectionController<M>();
        const usedSelectionController = collection.selectionController ?? selectionController;
        const {
            selectedEntities,
            setSelectedEntities
        } = usedSelectionController;

        const tableController = useDataSourceTableController<M>({
            path,
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
                addRecentId(collection.slug, clickedEntity.id);
            }

            const entityPath = collection?.collectionGroup ? clickedEntity.path : (path ?? clickedEntity.path);
            navigateToEntity({
                navigation,
                path: entityPath,
                sideEntityController,
                openEntityMode,
                collection,
                entityId: clickedEntity.id
            });

        }, [unselectNavigatedEntity, sideEntityController]);

        const onNewClick = useCallback(() => {
            const collection = collectionRef.current;
            analyticsController.onAnalyticsEvent?.("new_entity_click", {
                path: path
            });
            navigateToEntity({
                openEntityMode,
                collection,
                entityId: undefined,
                path: path,
                sideEntityController,
                navigation,
                onClose: unselectNavigatedEntity
            })
        }, [path, sideEntityController]);

        const onMultipleDeleteClick = () => {
            analyticsController.onAnalyticsEvent?.("multiple_delete_dialog_open", {
                path: path
            });
            setDeleteEntityClicked(selectedEntities);
        };

        const internalOnEntityDelete = (_path: string, entity: Entity<M>) => {
            analyticsController.onAnalyticsEvent?.("single_entity_deleted", {
                path: path
            });
            setSelectedEntities((selectedEntities) => selectedEntities.filter((e) => e.id !== entity.id));
            setDeletedEntities(prev => [...prev, entity]);
            setLastDeleteTimestamp(Date.now());
        };

        const internalOnMultipleEntitiesDelete = (_path: string, entities: Entity<M>[]) => {
            analyticsController.onAnalyticsEvent?.("multiple_entities_deleted", {
                path: path
            });
            setSelectedEntities([]);
            setDeleteEntityClicked(undefined);
            setDeletedEntities(prev => [...prev, ...entities]);
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

        const onTableSizeChanged = useCallback((size: CollectionSize) => {
            setTableSize(size);
            if (userConfigPersistence)
                onCollectionModifiedForUser(path, { defaultSize: size })
        }, [onCollectionModifiedForUser, path, userConfigPersistence]);

        // View mode change: update URL + save to local persistence
        const onViewModeChange = useCallback((mode: ViewMode) => {
            setViewMode(mode);
            // Save to local persistence for next visit
            if (userConfigPersistence) {
                onCollectionModifiedForUser(path, { defaultViewMode: mode } as PartialEntityCollection<M>);
            }
        }, [setViewMode, userConfigPersistence, onCollectionModifiedForUser, path]);

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
                path: entity.path ?? path,
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

        // In v4, collections are already resolved, so we use collection directly
        const resolvedCollection = collection;

        // Check if Kanban view is available (needs kanban.columnProperty with enum)
        const kanbanEnabled = useMemo(() => {
            if (!collection.kanban?.columnProperty) return false;
            const property = getPropertyInPath(resolvedCollection.properties, collection.kanban.columnProperty);
            if (!property || (property as any).type !== "string") return false;
            return Boolean((property as any).enum);
        }, [collection.kanban?.columnProperty, resolvedCollection.properties]);

        // Check if a plugin can configure Kanban (has KanbanSetupComponent)
        const hasKanbanConfigPlugin = useMemo(() => {
            return customizationController.plugins?.some(plugin => plugin.collectionView?.KanbanSetupComponent) ?? false;
        }, [customizationController.plugins]);

        // Compute available enum properties for kanban column selection
        const kanbanPropertyOptions: KanbanPropertyOption[] = useMemo(() => {
            const options: KanbanPropertyOption[] = [];
            const properties = resolvedCollection.properties;

            for (const [key, property] of Object.entries(properties)) {
                const prop = property as any;
                if (prop && prop.type === "string" && prop.enum) {
                    options.push({
                        key,
                        label: prop.name || key
                    });
                }
            }

            return options;
        }, [resolvedCollection.properties]);

        // Get saved kanban property from user config
        const getSavedKanbanProperty = useCallback((): string | undefined => {
            const saved = userConfigPersistence?.getCollectionConfig<M>(path);
            return (saved as any)?.kanbanColumnProperty;
        }, [userConfigPersistence, path]);

        // Selected kanban property state - priority: saved config > collection default > first available
        const [selectedKanbanProperty, setSelectedKanbanProperty] = useState<string>(() => {
            const saved = getSavedKanbanProperty();
            if (saved && kanbanPropertyOptions.some(o => o.key === saved)) return saved;
            if (collection.kanban?.columnProperty) return collection.kanban.columnProperty;
            return kanbanPropertyOptions[0]?.key ?? "";
        });

        // Update selected property if options change and current selection is no longer valid
        useEffect(() => {
            if (kanbanPropertyOptions.length > 0 && !kanbanPropertyOptions.some(o => o.key === selectedKanbanProperty)) {
                const saved = getSavedKanbanProperty();
                if (saved && kanbanPropertyOptions.some(o => o.key === saved)) {
                    setSelectedKanbanProperty(saved);
                } else if (collection.kanban?.columnProperty && kanbanPropertyOptions.some(o => o.key === collection.kanban?.columnProperty)) {
                    setSelectedKanbanProperty(collection.kanban.columnProperty);
                } else {
                    setSelectedKanbanProperty(kanbanPropertyOptions[0]?.key ?? "");
                }
            }
        }, [kanbanPropertyOptions, selectedKanbanProperty, getSavedKanbanProperty, collection.kanban?.columnProperty]);

        // Handle kanban property change
        const onKanbanPropertyChange = useCallback((property: string) => {
            setSelectedKanbanProperty(property);
            // Save to local persistence
            if (userConfigPersistence) {
                onCollectionModifiedForUser(path, { kanbanColumnProperty: property } as any);
            }
        }, [userConfigPersistence, onCollectionModifiedForUser, path]);

        const getPropertyFor = useCallback(({
            propertyKey,
            entity
        }: GetPropertyForProps<M>) => {
            let property: Property | undefined = getPropertyInPath(collection.properties, propertyKey);

            // we might not find the property in the collection if combining property builders and map spread
            if (!property) {
                // these 2 properties are coming from the resolved collection with default values
                property = getPropertyInPath(resolvedCollection.properties, propertyKey);
            }

            // In v4, properties are already resolved, so we return them directly
            return property ?? null;
        }, [collection.properties, resolvedCollection.properties]);

        // Use a collection with local propertiesOrder for optimistic UI updates
        const collectionWithLocalOrder = useMemo(() => {
            if (localPropertiesOrder && localPropertiesOrder !== resolvedCollection.propertiesOrder) {
                return {
                    ...resolvedCollection,
                    propertiesOrder: localPropertiesOrder
                };
            }
            return resolvedCollection;
        }, [resolvedCollection, localPropertiesOrder]);

        const displayedColumnIds = useColumnIds(collectionWithLocalOrder, true);

        const additionalFields = useMemo(() => {
            // v4: use getSubcollections helper to access subcollections
            const subcollectionsList = getSubcollections(collection);
            const subcollectionColumns: AdditionalFieldDelegate<M, any>[] = subcollectionsList.map((subcollection: EntityCollection) => {
                return {
                    key: getSubcollectionColumnId(subcollection),
                    name: subcollection.name,
                    width: 200,
                    dependencies: [],
                    Builder: ({ entity }: { entity: Entity }) => (
                        <Button
                            className={"max-w-full truncate justify-start"}
                            startIcon={<KeyboardTabIcon size={"small"} />}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                navigateToEntity({
                                    openEntityMode,
                                    collection,
                                    entityId: entity.id,
                                    selectedTab: subcollection.slug ?? subcollection.dbPath,
                                    path: path,
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

        // Update breadcrumb count when count changes (only if loaded)
        useEffect(() => {
            if (docsCount !== undefined) {
                breadcrumbs.updateCount(path, docsCount);
            }
        }, [docsCount, path, breadcrumbs.updateCount]);

        // EntitiesCount fetches count and updates breadcrumb - no visual rendering needed here
        const countFetcher = <EntitiesCount
            path={path}
            collection={collection}
            filter={tableController.filterValues}
            sortBy={tableController.sortBy}
            onCountChange={setDocsCount}
        />;


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
                            parentCollectionIds={parentCollectionIds ?? []} />;
                    })}
            </>;
        }, [customizationController.plugins, path, parentCollectionIds]);

        const addColumnComponentInternal = AddColumnComponent
            ? function () {
                if (typeof AddColumnComponent === "function")
                    return <AddColumnComponent path={path}
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
            path: path,
            parentCollectionIds
        });

        // Popover open state managed at parent level to prevent closing when view changes
        const [viewModePopoverOpen, setViewModePopoverOpen] = useState(false);

        // Create ViewModeToggle once to prevent remounting when view changes
        const viewModeToggleElement = (
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                kanbanEnabled={kanbanEnabled}
                hasKanbanConfigPlugin={hasKanbanConfigPlugin}
                size={viewMode === "table" ? tableSize : viewMode === "cards" ? cardSize : undefined}
                onSizeChanged={viewMode === "table" ? onTableSizeChanged : viewMode === "cards" ? setCardSize : undefined}
                open={viewModePopoverOpen}
                onOpenChange={setViewModePopoverOpen}
                kanbanPropertyOptions={kanbanPropertyOptions}
                selectedKanbanProperty={selectedKanbanProperty}
                onKanbanPropertyChange={onKanbanPropertyChange}
            />
        );

        return (
            <div className={cls("overflow-hidden h-full w-full rounded-md flex flex-col", className)}
                ref={containerRef}>

                {/* Unified toolbar - rendered once, outside view conditionals */}
                {countFetcher}
                <CollectionTableToolbar
                    loading={tableController.dataLoading}
                    onTextSearch={textSearchEnabled && textSearchInitialised ? tableController.setSearchString : undefined}
                    onTextSearchClick={textSearchEnabled && !textSearchInitialised ? onTextSearchClick : undefined}
                    textSearchLoading={textSearchLoading}
                    viewModeToggle={viewModeToggleElement}
                    actionsStart={<EntityCollectionViewStartActions
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController}
                        path={path}
                        relativePath={collection.dbPath}
                        selectionController={usedSelectionController}
                        collectionEntitiesCount={docsCount}
                        resolvedProperties={resolvedCollection.properties} />}
                    actions={<EntityCollectionViewActions
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController}
                        onMultipleDeleteClick={onMultipleDeleteClick}
                        onNewClick={onNewClick}
                        path={path}
                        relativePath={collection.dbPath}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}
                        collectionEntitiesCount={docsCount}
                    />}
                />

                {/* View content - only the view-specific content changes */}
                {viewMode === "kanban" ? (
                    <EntityCollectionBoardView
                        key={`kanban-view-${path}-${selectedKanbanProperty}`}
                        collection={collection}
                        tableController={tableController}
                        fullPath={path}
                        parentCollectionIds={parentCollectionIds}
                        columnProperty={selectedKanbanProperty}
                        onEntityClick={onEntityClick}
                        selectionController={usedSelectionController}
                        selectionEnabled={selectionEnabled}
                        highlightedEntities={highlightedEntity ? [highlightedEntity] : []}
                        deletedEntities={deletedEntities}
                        emptyComponent={canCreateEntities && tableController.filterValues === undefined && tableController.sortBy === undefined
                            ? <div className="flex flex-col items-center justify-center">
                                <Typography variant={"subtitle2"}>So empty...</Typography>
                                <Button
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
                ) : viewMode === "cards" ? (
                    <EntityCollectionCardView
                        key={`cards-view-${path}`}
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
                ) : (
                    <EntityCollectionTable
                        key={`collection_table_${path}`}
                        hideToolbar={true}
                        additionalFields={additionalFields}
                        tableController={tableController}
                        enablePopupIcon={true}
                        displayedColumnIds={displayedColumnIds}
                        onSizeChanged={onTableSizeChanged}
                        onEntityClick={onEntityClick}
                        onColumnResize={onColumnResize}
                        onValueChange={onValueChange}
                        tableRowActionsBuilder={tableRowActionsBuilder}
                        uniqueFieldValidator={uniqueFieldValidator}
                        selectionController={usedSelectionController}
                        highlightedEntities={highlightedEntity ? [highlightedEntity] : []}
                        defaultSize={tableSize}
                        properties={resolvedCollection.properties}
                        getPropertyFor={getPropertyFor}
                        onTextSearchClick={textSearchInitialised ? undefined : onTextSearchClick}
                        onScroll={tableController.onScroll}
                        initialScroll={tableController.initialScroll}
                        textSearchLoading={textSearchLoading}
                        textSearchEnabled={textSearchEnabled}
                        emptyComponent={canCreateEntities && tableController.filterValues === undefined && tableController.sortBy === undefined
                            ? <div className="flex flex-col items-center justify-center">
                                <Typography variant={"subtitle2"}>So empty...</Typography>
                                <Button
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
                            path={path}
                            idPath={path}
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
                                            fullPath: path,
                                            parentCollectionIds: parentCollectionIds ?? [],
                                            collection,
                                            newPropertiesOrder
                                        });
                                    });
                            }
                        }}
                    />
                )}

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
                    path={path}
                    onCellValueChange={onValueChange}
                    container={containerRef.current} />}

                {deleteEntityClicked &&
                    <DeleteEntityDialog
                        entityOrEntitiesToDelete={deleteEntityClicked}
                        path={path}
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
    // v4: use path directly instead of resolveIdsFrom
    const resolvedPath = path;

    useEffect(() => {
        if (dataSource.countEntities)
            dataSource.countEntities({
                path: resolvedPath,
                collection,
                filter,
                orderBy: sortByProperty,
                order: currentSort
            }).then(setCount).catch(setError);
    }, [path, dataSource.countEntities, resolvedPath, collection, filter, sortByProperty, currentSort]);

    useEffect(() => {
        if (onCountChange && count !== undefined) {
            setError(undefined);
            onCountChange(count);
        }
    }, [onCountChange, count]);

    if (error) {
        return null;
    }

    // Count is now displayed in the breadcrumb bar, this component only fetches and reports
    return null;
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
    idPath
}: {
    collection: EntityCollection,
    path: string,
    idPath: string
}) {

    const navigation = useNavigationController();
    const [openPopup, setOpenPopup] = React.useState(false);
    const [searchString, setSearchString] = React.useState("");
    const [recentIds, setRecentIds] = React.useState<string[]>(getRecentIds(collection.slug).map(String));
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
                            setRecentIds(addRecentId(collection.slug, entityId).map(String));
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
                                className={"rounded-lg bg-white dark:bg-surface-800 flex-grow bg-transparent outline-none p-2 " + focusedDisabled} />
                            <Button variant={"text"}
                                disabled={!(searchString.trim())}
                                type={"submit"}
                            ><KeyboardTabIcon /></Button>
                        </div>
                    </form>
                    {recentIds && recentIds.length > 0 && <div className="flex flex-col gap-2 p-2">
                        {recentIds.map(id => (
                            <ReferencePreview reference={new EntityReference({ id, path })}
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
                                size={"small"} />
                        ))}
                    </div>}
                </div>
            </Popover>

        </Tooltip>
    );
}
