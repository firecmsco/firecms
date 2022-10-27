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
    useNavigationContext,
    useSideEntityController
} from "../../hooks";
import { ErrorView } from "./ErrorView";
import { CustomDialogActions } from "./CustomDialogActions";
import { useSideDialogContext } from "../SideDialogs";
import { canCreateEntity, fullPathToCollectionSegments } from "../util";

/**
 * @category Components
 */
export interface ReferenceDialogProps<M extends Record<string, any>> {

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
     * If the dialog currently open, close it
     * @callback
        */
    onClose?(): void;

    /**
     * Allow selection of entities that pass the given filter only.
     */
    forceFilter?: FilterValues<string>;

}

/**
 * This component renders an overlay dialog that allows to select entities
 * in a given collection.
 * You probably want to open this dialog as a side view using {@link useReferenceDialog}
 * @category Components
 */
export function ReferenceDialog<M extends Record<string, any>>(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        multiselect,
        collection,
        path: pathInput,
        selectedEntityIds,
        forceFilter
    }: ReferenceDialogProps<M>) {

    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const navigation = useNavigationContext();

    const fullPath = navigation.resolveAliasesFrom(pathInput);

    const dataSource = useDataSource();

    const [selectedEntities, setSelectedEntities] = useState<Entity<any>[] | undefined>();
    const [entitiesDisplayedFirst, setEntitiesDisplayedFirst] = useState<Entity<any>[]>([]);

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
                        setSelectedEntities(result);
                        setEntitiesDisplayedFirst(result);
                    }
                });
        } else {
            setSelectedEntities([]);
            setEntitiesDisplayedFirst([]);
        }
        return () => {
            unmounted = true;
        };
    }, [dataSource, fullPath, selectedEntityIds, collection]);

    const onClear = useCallback(() => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(null);
        } else if (onMultipleEntitiesSelected) {
            onMultipleEntitiesSelected([]);
        }
    }, [multiselect, onMultipleEntitiesSelected, onSingleEntitySelected]);

    const toggleEntitySelection = useCallback((entity: Entity<any>) => {
        let newValue;
        if (selectedEntities) {
            if (selectedEntities.map((e) => e.id).indexOf(entity.id) > -1) {
                newValue = selectedEntities.filter((item: Entity<any>) => item.id !== entity.id);
            } else {
                newValue = [...selectedEntities, entity];
            }
            setSelectedEntities(newValue);

            if (onMultipleEntitiesSelected)
                onMultipleEntitiesSelected(newValue);
        }
    }, [onMultipleEntitiesSelected, selectedEntities]);

    const onEntityClick = useCallback((entity: Entity<any>) => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(entity);
            sideDialogContext.close(false);
        } else {
            toggleEntitySelection(entity);
        }
    }, [sideDialogContext, multiselect, onSingleEntitySelected, toggleEntitySelection]);

    const onNewClick = useCallback(() =>
            sideEntityController.open({
                path: fullPath,
                collection,
                updateUrl: true,
                onUpdate: ({ entity }) => {
                    setEntitiesDisplayedFirst([entity, ...entitiesDisplayedFirst]);
                    onEntityClick(entity);
                },
                closeOnSave: true
            }),
        [sideEntityController, fullPath, collection, entitiesDisplayedFirst, onEntityClick]);

    const tableRowActionsBuilder = useCallback(({
                                                    entity,
                                                    size,
                                                    width,
                                                    frozen
                                                }: { entity: Entity<any>, size: CollectionSize, width: number, frozen?: boolean }) => {

        const isSelected = selectedEntities && selectedEntities.map(e => e.id).indexOf(entity.id) > -1;
        return <EntityCollectionRowActions
            width={width}
            frozen={frozen}
            entity={entity}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
        />;

    }, [multiselect, selectedEntities, toggleEntitySelection]);

    const onDone = useCallback((event: React.SyntheticEvent) => {
        event.stopPropagation();
        sideDialogContext.close(false);
        if (onClose)
            onClose();
    }, [onClose, sideDialogContext]);

    if (!collection) {
        return <ErrorView
            error={"Could not find collection with id " + collection}/>

    }

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
                                           tableRowActionsBuilder={tableRowActionsBuilder}
                                           Title={<Typography variant={"h6"}>
                                               {collection.singularName ? `Select ${collection.singularName}` : `Select from ${collection.name}`}
                                           </Typography>}
                                           {...collection}
                                           inlineEditing={false}
                                           Actions={<ReferenceDialogActions
                                               collection={collection}
                                               path={fullPath}
                                               onNewClick={onNewClick}
                                               onClear={onClear}/>}
                                           entitiesDisplayedFirst={entitiesDisplayedFirst}
                    />}
            </Box>
            <CustomDialogActions translucent={false}>
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
