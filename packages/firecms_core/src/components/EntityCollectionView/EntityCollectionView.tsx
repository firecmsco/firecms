import React, { useCallback, useEffect, useMemo, useState } from "react";

import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityAction,
    EntityCollection, EntityTableController,
    FilterValues,
    PartialEntityCollection,
    PropertyOrBuilder,
    ResolvedProperty,
    SaveEntityProps
} from "../../types";
import {
    EntityCollectionRowActions,
    EntityCollectionTable,
    useDataSourceEntityCollectionTableController
} from "../EntityCollectionTable";

import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    getPropertyInPath,
    mergeDeep,
    resolveCollection,
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
import {
    AddIcon,
    Button,
    cls,
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
    OnCellValueChange,
    OnColumnResizeParams,
    UniqueFieldValidator,
    useColumnIds,
    useTableSearchHelper
} from "../common";
import { PopupFormField } from "../EntityCollectionTable/internal/popup_field/PopupFormField";
import { GetPropertyForProps } from "../EntityCollectionTable/EntityCollectionTableProps";
import { copyEntityAction, deleteEntityAction, editEntityAction } from "../common/default_entity_actions";
import { DeleteEntityDialog } from "../DeleteEntityDialog";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";
import { useSelectionController } from "./useSelectionController";
import { EntityCollectionViewStartActions } from "./EntityCollectionViewStartActions";

const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

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
     * If this is a subcollection, specify the parent collection ids.
     */
    parentCollectionIds?: string[];
    /**
     * Whether this is a subcollection or not.
     */
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
 * @group Components
 */
export const EntityCollectionView = React.memo(
    function EntityCollectionView<M extends Record<string, any>>({
                                                                     fullPath: fullPathProp,
                                                                     parentCollectionIds,
                                                                     isSubCollection,
                                                                     className,
                                                                     ...collectionProp
                                                                 }: EntityCollectionViewProps<M>
    ) {

        const context = useFireCMSContext();
        const fullPath = fullPathProp ?? collectionProp.path;
        const dataSource = useDataSource(collectionProp);
        const navigation = useNavigationController();
        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const analyticsController = useAnalyticsController();
        const customizationController = useCustomizationController();

        const containerRef = React.useRef<HTMLDivElement>(null);

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(fullPath);
            return (userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp) as EntityCollection<M>;
        }, [collectionProp, fullPath, userConfigPersistence?.getCollectionConfig]);

        const collectionRef = React.useRef(collection);
        useEffect(() => {
            collectionRef.current = collection;
        }, [collection]);

        const canCreateEntities = canCreateEntity(collection, authController, fullPath, null);
        const [selectedNavigationEntity, setSelectedNavigationEntity] = useState<Entity<M> | undefined>(undefined);
        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const [lastDeleteTimestamp, setLastDeleteTimestamp] = React.useState<number>(0);

        // number of entities in the collection
        const [docsCount, setDocsCount] = useState<number>(0);

        const unselectNavigatedEntity = useCallback(() => {
            const currentSelection = selectedNavigationEntity;
            setTimeout(() => {
                if (currentSelection === selectedNavigationEntity)
                    setSelectedNavigationEntity(undefined);
            }, 2400);
        }, [selectedNavigationEntity]);

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

        const selectionController = useSelectionController<M>();
        const usedSelectionController = collection.selectionController ?? selectionController;
        const {
            selectedEntities,
            isEntitySelected,
            setSelectedEntities
        } = usedSelectionController;

        useEffect(() => {
            setDeleteEntityClicked(undefined);
        }, [selectedEntities]);

        const tableController = useDataSourceEntityCollectionTableController<M>({
            fullPath,
            collection,
            lastDeleteTimestamp
        });

        const tableKey = React.useRef<string>(Math.random().toString(36));
        const popupCell = tableController.popupCell;

        const onPopupClose = useCallback(() => {
            tableController.setPopupCell?.(undefined);
        }, [tableController.setPopupCell]);

        const onEntityClick = useCallback((clickedEntity: Entity<M>) => {
            console.log("Entity clicked", clickedEntity)
            const collection = collectionRef.current;
            setSelectedNavigationEntity(clickedEntity);
            analyticsController.onAnalyticsEvent?.("edit_entity_clicked", {
                path: clickedEntity.path,
                entityId: clickedEntity.id
            });
            return sideEntityController.open({
                entityId: clickedEntity.id,
                path: clickedEntity.path,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity,
            });
        }, [unselectNavigatedEntity, sideEntityController]);

        const onNewClick = useCallback(() => {

            const collection = collectionRef.current;
            analyticsController.onAnalyticsEvent?.("new_entity_click", {
                path: fullPath
            });
            sideEntityController.open({
                path: fullPath,
                collection,
                updateUrl: true,
                onClose: unselectNavigatedEntity,
            });
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

        const createEnabled = canCreateEntity(collection, authController, fullPath, null);

        const uniqueFieldValidator: UniqueFieldValidator = useCallback(
            ({
                 name,
                 value,
                 property,
                 entityId
             }) => dataSource.checkUniqueField(fullPath, name, value, entityId),
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
                path: fullPath,
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
                }
            });

        };

        const resolvedFullPath = navigation.resolveAliasesFrom(fullPath);
        const resolvedCollection = useMemo(() => resolveCollection<M>({
            collection,
            path: fullPath,
            fields: customizationController.propertyConfigs
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
                fields: customizationController.propertyConfigs
            });
        }, [collection.properties, customizationController.propertyConfigs, resolvedCollection.properties]);

        const displayedColumnIds = useColumnIds(resolvedCollection, true);

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
                                startIcon={<KeyboardTabIcon size={"small"}/>}
                                onClick={(event: any) => {
                                    event.stopPropagation();
                                    sideEntityController.open({
                                        path: fullPath,
                                        entityId: entity.id,
                                        selectedSubPath: subcollection.id ?? subcollection.path,
                                        collection,
                                        updateUrl: true,
                                    });
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
                                            size={"tiny"}/>
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
                actions.push(...customEntityActions);
            return actions;
        };

        const getIdColumnWidth = () => {
            const entityActions = getActionsForEntity({});
            const collapsedActions = entityActions.filter(a => a.collapsed !== false);
            const uncollapsedActions = entityActions.filter(a => a.collapsed === false);
            const actionsWidth = uncollapsedActions.length * (largeLayout ? 40 : 30);
            return (largeLayout ? (80 + actionsWidth) : (70 + actionsWidth)) + (collapsedActions.length > 0 ? (largeLayout ? 40 : 30) : 0);
        };

        const tableRowActionsBuilder = ({
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

            const actions = getActionsForEntity({
                entity,
                customEntityActions: collection.entityActions
            });

            return (
                <EntityCollectionRowActions
                    entity={entity}
                    width={width}
                    frozen={frozen}
                    isSelected={isSelected}
                    selectionEnabled={selectionEnabled}
                    size={size}
                    highlightEntity={setSelectedNavigationEntity}
                    unhighlightEntity={unselectNavigatedEntity}
                    collection={collection}
                    fullPath={fullPath}
                    actions={actions}
                    hideId={collection?.hideIdFromCollection}
                    onCollectionChange={updateLastDeleteTimestamp}
                    selectionController={usedSelectionController}
                />
            );

        };

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

            {collection.description && <div className="m-4 text-gray-900 dark:text-white">
                <Markdown source={collection.description}/>
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
                            parentCollectionIds={parentCollectionIds ?? []}/>;
                    })}
            </>;
        }, [customizationController.plugins, fullPath, parentCollectionIds]);

        const addColumnComponentInternal = AddColumnComponent
            ? function () {
                if (typeof AddColumnComponent === "function")
                    return <AddColumnComponent fullPath={fullPath}
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
            collection,
            fullPath: resolvedFullPath,
            parentCollectionIds
        });

        return (
            <div className={cls("overflow-hidden h-full w-full rounded-md", className)}
                 ref={containerRef}>
                <EntityCollectionTable
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
                    highlightedEntities={selectedNavigationEntity ? [selectedNavigationEntity] : []}
                    defaultSize={collection.defaultSize}
                    properties={resolvedCollection.properties}
                    getPropertyFor={getPropertyFor}
                    onTextSearchClick={textSearchInitialised ? undefined : onTextSearchClick}
                    textSearchLoading={textSearchLoading}
                    textSearchEnabled={textSearchEnabled}
                    actionsStart={<EntityCollectionViewStartActions
                        parentCollectionIds={parentCollectionIds ?? []}
                        collection={collection}
                        tableController={tableController}
                        path={fullPath}
                        relativePath={collection.path}
                        selectionController={usedSelectionController}
                        collectionEntitiesCount={docsCount}/>}
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
                        path={fullPath}
                        collection={collection}/>}
                />

                <PopupFormField
                    key={`popup_form_${popupCell?.propertyKey}_${popupCell?.entity?.id}`}
                    open={Boolean(popupCell)}
                    onClose={onPopupClose}
                    cellRect={popupCell?.cellRect}
                    propertyKey={popupCell?.propertyKey}
                    collection={collection}
                    entity={popupCell?.entity}
                    tableKey={tableKey.current}
                    customFieldValidator={uniqueFieldValidator}
                    path={resolvedFullPath}
                    onCellValueChange={onValueChange}
                    container={containerRef.current}/>

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
    }, (a, b) => {
        return equal(a.fullPath, b.fullPath) &&
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
            equal(a.textSearchEnabled, b.textSearchEnabled) &&
            equal(a.additionalFields, b.additionalFields) &&
            equal(a.sideDialogWidth, b.sideDialogWidth) &&
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
    const resolvedPath = useMemo(() => navigation.resolveAliasesFrom(fullPath), [fullPath, navigation.resolveAliasesFrom]);

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
                                  path
                              }: {
    collection: EntityCollection,
    path: string
}) {
    const [openPopup, setOpenPopup] = React.useState(false);
    const [searchString, setSearchString] = React.useState("");
    const sideEntityController = useSideEntityController();
    return (
        <Tooltip title={!openPopup ? "Find by ID" : undefined}>
            <Popover
                open={openPopup}
                onOpenChange={setOpenPopup}
                trigger={
                    <IconButton size={"small"}>
                        <SearchIcon size={"small"}/>
                    </IconButton>
                }
            >
                <form noValidate={true}
                      onSubmit={(e) => {
                          e.preventDefault();
                          if (!searchString) return;
                          setOpenPopup(false);
                          return sideEntityController.open({
                              entityId: searchString.trim(),
                              path,
                              collection,
                              updateUrl: true,
                          });
                      }}
                      className={"text-gray-900 dark:text-white w-96 max-w-full"}>

                    <div className="flex p-2 w-full gap-4">
                        <input
                            autoFocus={openPopup}
                            placeholder={"Find entity by ID"}
                            // size={"small"}
                            onChange={(e) => {
                                setSearchString(e.target.value);
                            }}
                            value={searchString}
                            className={"flex-grow bg-transparent outline-none p-1"}/>
                        <Button variant={"outlined"}
                                disabled={!(searchString.trim())}
                                type={"submit"}
                        >Go</Button>
                    </div>
                </form>
            </Popover>

        </Tooltip>
    );
}
