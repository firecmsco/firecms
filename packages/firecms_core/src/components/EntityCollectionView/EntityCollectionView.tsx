import React, { useCallback, useEffect, useMemo, useState } from "react";

import equal from "react-fast-compare"

import {
    AdditionalFieldDelegate,
    CollectionSize,
    Entity,
    EntityAction,
    EntityCollection,
    FilterValues,
    PartialEntityCollection,
    PropertyOrBuilder,
    ResolvedProperty,
    SaveEntityProps,
    SelectionController
} from "../../types";
import {
    EntityCollectionTable,
    OnCellValueChange,
    OnColumnResizeParams,
    UniqueFieldValidator
} from "../EntityCollectionTable";

import { EntityCollectionRowActions } from "../EntityCollectionTable/internal/EntityCollectionRowActions";

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
import { ReferencePreview } from "../../preview";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useFireCMSContext,
    useLargeLayout,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { useUserConfigurationPersistence } from "../../hooks/useUserConfigurationPersistence";
import { EntityCollectionViewActions } from "./EntityCollectionViewActions";
import { useDataSourceEntityCollectionTableController } from "../EntityCollectionTable/useDataSourceEntityCollectionTableController";
import {
    AddIcon,
    Button,
    cn,
    IconButton,
    KeyboardTabIcon,
    Markdown,
    Popover,
    SearchIcon,
    Skeleton,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import { setIn } from "formik";
import { getSubcollectionColumnId } from "../EntityCollectionTable/internal/common";
import { useColumnIds } from "./useColumnsIds";
import { PopupFormField } from "../EntityCollectionTable/internal/popup_field/PopupFormField";
import { GetPropertyForProps } from "../EntityCollectionTable/EntityCollectionTableProps";
import {
    copyEntityAction,
    deleteEntityAction,
    editEntityAction
} from "../EntityCollectionTable/internal/default_entity_actions";
import { DeleteEntityDialog } from "../DeleteEntityDialog";

const COLLECTION_GROUP_PARENT_ID = "collectionGroupParent";

/**
 * @group Components
 */
export type EntityCollectionViewProps<M extends Record<string, any>> = {
    fullPath: string;
    parentCollectionIds?: string[];
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
                                                                     fullPath,
                                                                     parentCollectionIds,
                                                                     isSubCollection,
                                                                     className,
                                                                     ...collectionProp
                                                                 }: EntityCollectionViewProps<M>
    ) {

        const dataSource = useDataSource();
        const navigation = useNavigationController();
        const sideEntityController = useSideEntityController();
        const authController = useAuthController();
        const userConfigPersistence = useUserConfigurationPersistence();
        const context = useFireCMSContext();

        const containerRef = React.useRef<HTMLDivElement>(null);

        const collection = useMemo(() => {
            const userOverride = userConfigPersistence?.getCollectionConfig<M>(fullPath);
            return (userOverride ? mergeDeep(collectionProp, userOverride) : collectionProp) as EntityCollection<M>;
        }, [collectionProp, fullPath, userConfigPersistence?.getCollectionConfig]);

        const canCreateEntities = canCreateEntity(collection, authController, fullPathToCollectionSegments(fullPath), null);
        const [selectedNavigationEntity, setSelectedNavigationEntity] = useState<Entity<M> | undefined>(undefined);
        const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<M> | Entity<M>[] | undefined>(undefined);

        const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
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
            if (!canEditEntity(collection, authController, fullPathToCollectionSegments(fullPath), entity ?? null)) {
                return false;
            }
            return collection.inlineEditing === undefined || collection.inlineEditing;
        }, [collection, authController, fullPath]);

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

        const tableController = useDataSourceEntityCollectionTableController<M>({
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
                path: clickedEntity.path,
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

        let AddColumnComponent: React.ComponentType<{
            fullPath: string,
            parentCollectionIds: string[],
            collection: EntityCollection;
        }> | undefined

        // we are only using the first plugin that implements this
        if (context?.plugins) {
            AddColumnComponent = context.plugins.find(plugin => plugin.collectionView?.AddColumnComponent)?.collectionView?.AddColumnComponent;
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
             }) => dataSource.checkUniqueField(fullPath, name, value, entityId),
            [fullPath]);

        const onValueChange: OnCellValueChange<any, any> = ({
                                                                fullPath,
                                                                context,
                                                                value,
                                                                propertyKey,
                                                                onValueUpdated,
                                                                setError,
                                                                entity,
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
            fields: context.propertyConfigs
        }), [collection, fullPath]);

        const getPropertyFor = useCallback(({
                                                propertyKey,
                                                propertyValue,
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
                path: fullPath,
                propertyValue,
                values: entity.values,
                entityId: entity.id,
                fields: context.propertyConfigs
            });
        }, [collection.properties, context.propertyConfigs, fullPath, resolvedCollection.properties]);

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
                                        updateUrl: true
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
                ...(collection.additionalFields ?? []),
                ...subcollectionColumns,
                ...collectionGroupParentCollections
            ];
        }, [collection, fullPath]);

        const updateLastDeleteTimestamp = useCallback(() => {
            setLastDeleteTimestamp(Date.now());
        }, []);

        const largeLayout = useLargeLayout();

        const getActionsForEntity = useCallback(({ entity, customEntityActions }: {
            entity?: Entity<M>,
            customEntityActions?: EntityAction[]
        }): EntityAction[] => {
            const deleteEnabled = entity ? canDeleteEntity(collection, authController, fullPathToCollectionSegments(fullPath), entity) : true;
            const actions: EntityAction[] = [editEntityAction];
            if (createEnabled)
                actions.push(copyEntityAction);
            if (deleteEnabled)
                actions.push(deleteEntityAction);
            if (customEntityActions)
                actions.push(...customEntityActions);
            return actions;
        }, [authController, collection, createEnabled, fullPath]);

        const getIdColumnWidth = useCallback(() => {
            const entityActions = getActionsForEntity({});
            const collapsedActions = entityActions.filter(a => a.collapsed !== false);
            const uncollapsedActions = entityActions.filter(a => a.collapsed === false);
            const actionsWidth = uncollapsedActions.length * (largeLayout ? 40 : 30);
            return (largeLayout ? (80 + actionsWidth) : (70 + actionsWidth)) + (collapsedActions.length > 0 ? (largeLayout ? 40 : 30) : 0);
        }, [largeLayout, getActionsForEntity]);

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

            const actions = getActionsForEntity({ entity, customEntityActions: collection.entityActions });

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

        }, [isEntitySelected, collection, authController, fullPath, selectionEnabled, toggleEntitySelection, createEnabled]);

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
                    onCountChange={setDocsCount}
                />

            </div>}
        >

            {collection.description && <div className="m-4 text-gray-900 dark:text-white">
                <Markdown source={collection.description}/>
            </div>}

        </Popover>;

        function buildAdditionalHeaderWidget({
                                                 property,
                                                 propertyKey,
                                                 onHover
                                             }: {
            property: ResolvedProperty,
            propertyKey: string,
            onHover: boolean
        }) {
            if (!context.plugins)
                return null;
            return <>
                {context.plugins.filter(plugin => plugin.collectionView?.HeaderAction)
                    .map((plugin, i) => {
                        const HeaderAction = plugin.collectionView!.HeaderAction!;
                        return <HeaderAction
                            onHover={onHover}
                            key={`plugin_header_action_${i}`}
                            propertyKey={propertyKey}
                            property={property}
                            fullPath={fullPath}
                            collection={collection}
                            parentCollectionIds={parentCollectionIds ?? []}/>;
                    })}
            </>;
        }

        const addColumnComponentInternal = AddColumnComponent
            ? function () {
                if (typeof AddColumnComponent === "function")
                    return <AddColumnComponent fullPath={fullPath}
                                               parentCollectionIds={parentCollectionIds ?? []}
                                               collection={collection}/>;
                return null;
            }
            : undefined;

        const [textSearchInitialised, setTextSearchInitialised] = useState<boolean>(false);
        let onTextSearchClick: (() => void) | undefined;
        let textSearchEnabled = Boolean(collection.textSearchEnabled);
        if (context?.plugins) {
            const addTextSearchClickListener = context.plugins?.find(p => Boolean(p.collectionView?.onTextSearchClick));

            onTextSearchClick = addTextSearchClickListener
                ? () => {
                    setTextSearchLoading(true);
                    Promise.all(context.plugins?.map(p => {
                        if (p.collectionView?.onTextSearchClick)
                            return p.collectionView.onTextSearchClick({ context, path: resolvedFullPath, collection, parentCollectionIds });
                        return Promise.resolve(true);
                    }) as Promise<boolean>[])
                        .then((res) => {
                            if (res.every(Boolean)) setTextSearchInitialised(true);
                        })
                        .finally(() => setTextSearchLoading(false));
                }
                : undefined;

            context.plugins?.forEach(p => {
                if (!textSearchEnabled)
                    if (p.collectionView?.showTextSearchBar) {
                        textSearchEnabled = p.collectionView.showTextSearchBar({ context, path: resolvedFullPath, collection, parentCollectionIds });
                    }
            })
        }

        return (
            <div className={cn("overflow-hidden h-full w-full", className)}
                 ref={containerRef}>
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
                    onTextSearchClick={textSearchInitialised ? undefined : onTextSearchClick}
                    textSearchLoading={textSearchLoading}
                    textSearchEnabled={textSearchEnabled}
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
                           sortBy,
                           onCountChange
                       }: {
    fullPath: string,
    collection: EntityCollection,
    filter?: FilterValues<any>,
    sortBy?: [string, "asc" | "desc"],
    onCountChange?: (count: number) => void,
}) {

    const dataSource = useDataSource();
    const navigation = useNavigationController();
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

    useEffect(() => {
        if (onCountChange) {
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
                              entityId: searchString,
                              path,
                              collection,
                              updateUrl: true
                          });
                      }}
                      className={"text-gray-900 dark:text-white w-96 max-w-full"}>

                    <div className="flex p-4 w-full gap-4">
                        <TextField
                            placeholder={"Find entity by ID"}
                            size={"small"}
                            onChange={(e) => setSearchString(e.target.value)}
                            value={searchString}
                            className={"flex-grow"}/>
                        <Button variant={"outlined"}
                                disabled={!searchString}
                                type={"submit"}
                        >Go</Button>
                    </div>
                </form>
            </Popover>

        </Tooltip>
    );
}
