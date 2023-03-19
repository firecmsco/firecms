import React, { useCallback, useEffect, useState } from "react";
import {
    CollectionSize,
    Entity,
    EntityCollection,
    FilterValues
} from "../../types";
import {
    Box,
    Button,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { Add } from "@mui/icons-material";

import { EntityCollectionTable } from "./EntityCollectionTable";
import {
    EntityCollectionRowActions
} from "./EntityCollectionTable/internal/EntityCollectionRowActions";
import {
    useAuthController,
    useDataSource,
    useFireCMSContext,
    useNavigationContext,
    useSideEntityController
} from "../../hooks";
import { ErrorView } from "./ErrorView";
import { CustomDialogActions } from "./CustomDialogActions";
import { useSideDialogContext } from "../SideDialogs";
import { canCreateEntity, fullPathToCollectionSegments } from "../util";
import {
    useSelectionController
} from "./EntityCollectionView/EntityCollectionView";
import { useTableController } from "./EntityCollectionTable/useTableController";
import {
    isFilterCombinationValidForFirestore
} from "./EntityCollectionView/isFilterCombinationValidForFirestore";

/**
 * @category Components
 */
export interface ReferenceSelectionInnerProps<M extends Record<string, any>> {

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
    selectedEntityIds?: string[];

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
 * You probably want to open this dialog as a side view using {@link useReferenceDialog}
 * @category Components
 */
export function ReferenceSelectionInner<M extends Record<string, any>>(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        multiselect,
        collection,
        path: pathInput,
        selectedEntityIds,
        description,
        forceFilter,
        maxSelection
    }: ReferenceSelectionInnerProps<M>) {

    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const navigation = useNavigationContext();
    const context = useFireCMSContext();

    const fullPath = navigation.resolveAliasesFrom(pathInput);

    const dataSource = useDataSource();

    const [entitiesDisplayedFirst, setEntitiesDisplayedFirst] = useState<Entity<any>[]>([]);

    const selectionController = useSelectionController();

    /**
     * Fetch initially selected ids
     */
    useEffect(() => {
        let unmounted = false;
        if (selectedEntityIds && collection) {
            Promise.all(
                selectedEntityIds.map((entityId) =>
                    dataSource.fetchEntity({
                        path: fullPath,
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
    }, [dataSource, fullPath, selectedEntityIds, collection, selectionController.setSelectedEntities]);

    const onClear = useCallback(() => {
        context.onAnalyticsEvent?.("reference_selection_clear", {
            path: fullPath
        });
        selectionController.setSelectedEntities([]);
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(null);
        } else if (onMultipleEntitiesSelected) {
            onMultipleEntitiesSelected([]);
        }
    }, [multiselect, onMultipleEntitiesSelected, onSingleEntitySelected]);

    const toggleEntitySelection = useCallback((entity: Entity<any>) => {
        let newValue;
        const selectedEntities = selectionController.selectedEntities;

        context.onAnalyticsEvent?.("reference_selection_toggle", {
            path: fullPath,
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
    }, [onMultipleEntitiesSelected, selectionController.selectedEntities]);

    const onEntityClick = useCallback((entity: Entity<any>) => {

        if (!multiselect && onSingleEntitySelected) {
            context.onAnalyticsEvent?.("reference_selected_single", {
                path: fullPath,
                entityId: entity.id
            });
            onSingleEntitySelected(entity);
            sideDialogContext.close(false);
        } else {
            toggleEntitySelection(entity);
        }
    }, [sideDialogContext, multiselect, onSingleEntitySelected, toggleEntitySelection]);

    // create a new entity from within the reference dialog
    const onNewClick = useCallback(() => {
            context.onAnalyticsEvent?.("reference_selection_new_entity", {
                path: fullPath
            });
            sideEntityController.open({
                path: fullPath,
                collection,
                updateUrl: true,
                onUpdate: ({ entity }) => {
                    setEntitiesDisplayedFirst([entity, ...entitiesDisplayedFirst]);
                    onEntityClick(entity);
                },
                closeOnSave: true
            });
        },
        [sideEntityController, fullPath, collection, entitiesDisplayedFirst, onEntityClick]);

    const tableRowActionsBuilder = useCallback(({
                                                    entity,
                                                    size,
                                                    width,
                                                    frozen
                                                }: { entity: Entity<any>, size: CollectionSize, width: number, frozen?: boolean }) => {
        const selectedEntities = selectionController.selectedEntities;
        const isSelected = selectedEntities && selectedEntities.map(e => e.id).indexOf(entity.id) > -1;
        return <EntityCollectionRowActions
            width={width}
            frozen={frozen}
            entity={entity}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
            hideId={collection?.hideIdFromCollection}
        />;

    }, [multiselect, selectionController.selectedEntities, toggleEntitySelection, collection?.hideIdFromCollection]);

    const onDone = useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
        sideDialogContext.close(false);
    }, [sideDialogContext]);

    if (!collection) {
        return <ErrorView
            error={"Could not find collection with id " + collection}/>
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tableController = useTableController<M>({
        fullPath,
        collection,
        entitiesDisplayedFirst,
        isFilterCombinationValid: isFilterCombinationValidForFirestore
    });

    return (

        <Box sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%"
        }}>

            <Box sx={{ flexGrow: 1 }}>
                {entitiesDisplayedFirst &&
                    <EntityCollectionTable fullPath={fullPath}
                                           onEntityClick={onEntityClick}
                                           forceFilter={forceFilter}
                                           tableController={tableController}
                                           tableRowActionsBuilder={tableRowActionsBuilder}
                                           title={<Typography variant={"h6"}>
                                               {collection.singularName ? `Select ${collection.singularName}` : `Select from ${collection.name}`}
                                           </Typography>}
                                           {...collection}
                                           inlineEditing={false}
                                           selectionController={selectionController}
                                           actions={<ReferenceDialogActions
                                               collection={collection}
                                               path={fullPath}
                                               onNewClick={onNewClick}
                                               onClear={onClear}/>
                                           }
                    />}
            </Box>
            <CustomDialogActions translucent={false}>
                {description &&
                    <Typography variant={"body2"} sx={{
                        flexGrow: 1,
                        textAlign: "left"
                    }}>
                        {description}
                    </Typography>}
                <Button
                    onClick={onDone}
                    color="primary"
                    variant="outlined">
                    Done
                </Button>
            </CustomDialogActions>
        </Box>

    );

}

function ReferenceDialogActions({
                                    collection,
                                    path,
                                    onClear,
                                    onNewClick
                                }: { collection: EntityCollection<any>, path: string, onClear: () => void, onNewClick: () => void }) {

    const authController = useAuthController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const addButton = canCreateEntity(collection, authController, fullPathToCollectionSegments(path), null) &&
        onNewClick && (largeLayout
            ? <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {collection.singularName ?? collection.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

    return (
        <>
            <Button onClick={onClear}
                    color="primary">
                Clear
            </Button>
            {addButton}
        </>
    );
}
