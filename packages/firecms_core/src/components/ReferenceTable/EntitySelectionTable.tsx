import React, { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { CollectionSize, Entity, EntityCollection, FilterValues } from "@firecms/types";

import {
    EntityCollectionRowActions,
    EntityCollectionTable,
    useDataSourceTableController
} from "../EntityCollectionTable";
import {
    useAuthController,
    useCustomizationController,
    useDataSource,
    useLargeLayout,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { ErrorView } from "../ErrorView";
import { AddIcon, Button, DialogActions, Typography } from "@firecms/ui";
import { IconForView } from "../../util";
import { useSelectionController } from "../EntityCollectionView/useSelectionController";
import { useColumnIds, useTableSearchHelper } from "../common";
import { useSideDialogContext } from "../../core";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";
import { canCreateEntity } from "@firecms/common";

/**
 * @group Components
 */
export interface EntitySelectionProps<M extends Record<string, any>> {

    /**
     * Allow multiple selection of values
     */
    multiselect?: boolean;

    /**
     * Entity collection config
     */
    collection?: EntityCollection<M>;

    /**
     * Absolute path of the collection.
     * May be not set if this hook is being used in a component and the path is
     * dynamic. If not set, the dialog won't open.
     */
    path: string;

    /**
     * If you are opening the dialog for the first time, you can select some
     * entity ids to be displayed first.
     */
    selectedEntityIds?: (string | number)[];

    /**
     * If `multiselect` is set to `false`, you will get the selected entity
     * in this callback.
     * @param entity
     * @callback
     */
    onSingleEntitySelected?(entity: Entity<any> | null): void;

    /**
     * If `multiselect` is set to `true`, you will get the selected entities
     * in this callback.
     * @param entities
     * @callback
     */
    onMultipleEntitiesSelected?(entities: Entity<any>[]): void;

    /**
     * Allow selection of entities that pass the given filter only.
     */
    forceFilter?: FilterValues<string>;

    /**
     * Use this description to indicate the user what to do in this dialog.
     */
    description?: React.ReactNode;

    /**
     * Maximum number of entities that can be selected.
     */
    maxSelection?: number;

}

/**
 * This component allows to select entities from a given collection.
 * You probably want to open this dialog as a side view using {@link useEntitySelectionTable}
 * @group Components
 */
export function EntitySelectionTable<M extends Record<string, any>>(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        multiselect,
        collection,
        path: pathInput,
        selectedEntityIds: selectedEntityIdsProp,
        description,
        forceFilter,
        maxSelection,
    }: EntitySelectionProps<M>) {

    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const navigation = useNavigationController();
    const analyticsController = useAnalyticsController();

    const path = navigation.resolveDatabasePathsFrom(pathInput);

    const dataSource = useDataSource(collection);

    const [entitiesDisplayedFirst, setEntitiesDisplayedFirst] = useState<Entity<any>[]>([]);

    const toggleEntitySelection = (entity: Entity<any>) => {
        let newValue;
        const selectedEntities = selectionController.selectedEntities;

        analyticsController.onAnalyticsEvent?.("reference_selection_toggle", {
            path,
            entityId: entity.id
        });
        if (selectedEntities) {

            if (selectedEntities.map((e) => e.id).indexOf(entity.id) > -1) {
                newValue = selectedEntities.filter((item: Entity<any>) => item.id !== entity.id);
            } else {
                if (maxSelection && selectedEntities.length >= maxSelection)
                    return;
                newValue = [...selectedEntities, entity];
            }
            selectionController.setSelectedEntities(newValue);

            if (onMultipleEntitiesSelected)
                onMultipleEntitiesSelected(newValue);
        }
    };

    const selectionController = useSelectionController(toggleEntitySelection);

    /**
     * Fetch initially selected ids
     */
    useEffect(() => {
        let unmounted = false;
        const selectedEntityIds = selectedEntityIdsProp?.map(id => id?.toString()).filter(Boolean);
        if (selectedEntityIds && collection) {
            Promise.all(
                selectedEntityIds.map((entityId) =>
                    dataSource.fetchEntity({
                        path,
                        entityId,
                        collection
                    })))
                .then((entities) => {
                    if (!unmounted) {
                        const result = entities.filter(e => e !== undefined) as Entity<any>[];
                        selectionController.setSelectedEntities(result);
                        setEntitiesDisplayedFirst(result);
                    }
                });
        } else {
            selectionController.setSelectedEntities([]);
            setEntitiesDisplayedFirst([]);
        }
        return () => {
            unmounted = true;
        };
    }, [dataSource, path, selectedEntityIdsProp, collection, selectionController.setSelectedEntities]);

    const onClear = () => {
        analyticsController.onAnalyticsEvent?.("reference_selection_clear", {
            path
        });
        selectionController.setSelectedEntities([]);
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(null);
        } else if (onMultipleEntitiesSelected) {
            onMultipleEntitiesSelected([]);
        }
    };

    const onEntityClick = (entity: Entity<any>) => {
        if (!multiselect && onSingleEntitySelected) {
            analyticsController.onAnalyticsEvent?.("reference_selected_single", {
                path,
                entityId: entity.id
            });
            onSingleEntitySelected(entity);
            sideDialogContext.close(false);
        } else {
            toggleEntitySelection(entity);
        }
    };

    // create a new entity from within the reference dialog
    const onNewClick = () => {
        analyticsController.onAnalyticsEvent?.("reference_selection_new_entity", {
            path
        });
        sideEntityController.open({
            path: path,
            collection,
            updateUrl: true,
            onUpdate: ({ entity }) => {
                setEntitiesDisplayedFirst([entity, ...entitiesDisplayedFirst]);
                onEntityClick(entity);
            },
            closeOnSave: true
        });
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
        const selectedEntities = selectionController.selectedEntities;
        const isSelected = selectedEntities && selectedEntities.map(e => e.id).indexOf(entity.id) > -1;
        return <EntityCollectionRowActions
            width={width}
            frozen={frozen}
            entity={entity}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            hideId={collection?.hideIdFromCollection}
            path={path}
            selectionController={selectionController}
            openEntityMode={"side_panel"}
        />;

    };

    const onDone = useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
        sideDialogContext.close(false);
    }, [sideDialogContext]);

    if (!collection) {
        return <ErrorView
            error={"Could not find collection with id " + collection} />
    }

    const displayedColumnIds = useColumnIds(collection, false);

    const tableController = useDataSourceTableController<M>({
        path,
        collection,
        entitiesDisplayedFirst,
        forceFilter,
        updateUrl: false,
    });

    const {
        textSearchLoading,
        textSearchInitialised,
        onTextSearchClick
    } =
        useTableSearchHelper({
            collection,
            path,
        });

    return (

        <div className="flex flex-col h-full">

            <div className="grow">
                {entitiesDisplayedFirst &&
                    <EntityCollectionTable
                        textSearchLoading={textSearchLoading}
                        onTextSearchClick={!textSearchInitialised ? onTextSearchClick : undefined}
                        additionalFields={collection.additionalFields}
                        displayedColumnIds={displayedColumnIds}
                        onEntityClick={onEntityClick}
                        tableController={tableController}
                        enablePopupIcon={false}
                        tableRowActionsBuilder={tableRowActionsBuilder}
                        openEntityMode={"side_panel"}
                        title={<Typography variant={"subtitle2"} className={"flex flex-row gap-2"}>
                            <IconForView
                                size={"small"}
                                collectionOrView={collection}
                                className={"text-surface-300 dark:text-surface-600"} />
                            {collection.singularName
                                ? `Select ${collection.singularName}`
                                : `Select from ${collection.name}`}
                        </Typography>}
                        defaultSize={collection.defaultSize}
                        properties={collection.properties}
                        forceFilter={forceFilter}
                        inlineEditing={false}
                        selectionController={selectionController}
                        actions={<EntitySelectionDialogActions
                            collection={collection}
                            path={path}
                            onNewClick={onNewClick}
                            onClear={onClear} />
                        }
                    />}
            </div>
            <DialogActions translucent={false}>
                {description &&
                    <Typography variant={"body2"}
                        className="grow text-left">
                        {description}
                    </Typography>}
                <Button
                    onClick={onDone}
                    variant="filled">
                    Done
                </Button>
            </DialogActions>
        </div>

    );

}

function EntitySelectionDialogActions({
    collection,
    path,
    onClear,
    onNewClick
}: {
    collection: EntityCollection<any>,
    path: string,
    onClear: () => void,
    onNewClick: () => void
}) {

    const authController = useAuthController();

    const largeLayout = useLargeLayout();

    const onClick: MouseEventHandler<HTMLButtonElement> | undefined = onNewClick
        ? (e) => {
            e.preventDefault();
            onNewClick();
        }
        : undefined;
    const addButton = canCreateEntity(collection, authController, path, null) &&
        onClick && (largeLayout
            ? <Button
                onClick={onClick}
                startIcon={<AddIcon />}>
                Add {collection.singularName ?? collection.name}
            </Button>
            : <Button
                onClick={onClick}>
                <AddIcon />
            </Button>);

    return (
        <>
            <Button onClick={onClear}
                variant={"text"}>
                Clear
            </Button>
            {addButton}
        </>
    );
}
