import React, { useCallback, useEffect, useState } from "react";
import { CollectionSize, Entity, EntityCollection } from "../../models";
import { Box, Button, Typography, useTheme } from "@mui/material";

import { EntityCollectionTable } from "./CollectionTable";
import {
    CollectionRowActions
} from "./CollectionTable/internal/CollectionRowActions";
import { useDataSource, useNavigationContext } from "../../hooks";
import { ErrorView } from "./ErrorView";
import { CustomDialogActions } from "./CustomDialogActions";
import { useSideDialogsController } from "../../hooks/useSideDialogsController";
import { useSideDialogContext } from "../SideDialogs";

/**
 * @category Components
 */
export interface ReferenceDialogProps {

    /**
     * Allow multiple selection of values
     */
    multiselect: boolean;

    /**
     * Entity collection config
     */
    collection: EntityCollection;

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
     * If `multiselect` is set to `false`, you will get the select entity
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
     * Is the dialog currently open
     * @callback
        */
    onClose?(): void;

}

export function useReferenceDialogController(referenceDialogProps: Omit<ReferenceDialogProps, "path"> & {
    path?: string | false;
}) {

    const sideDialogsController = useSideDialogsController();
    const open = useCallback(() => {
        if (referenceDialogProps.path) {
            sideDialogsController.open({
                key: `reference_${referenceDialogProps.path}`,
                Component: ReferenceDialog,
                props: referenceDialogProps as ReferenceDialogProps,
                width: "90vw"
            });
        }
    }, [referenceDialogProps, sideDialogsController]);

    const close = useCallback(() => {
        sideDialogsController.close();
    }, [sideDialogsController]);

    return {
        open,
        close
    }

}

/**
 * This component renders an overlay dialog that allows to select entities
 * in a given collection.
 * You probably want to open this dialog as a side view using {@link useReferenceDialogController}
 * @category Components
 */
export function ReferenceDialog(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        multiselect,
        collection,
        path: pathInput,
        selectedEntityIds
    }: ReferenceDialogProps) {

    const navigationContext = useNavigationContext();
    const sideDialogContext = useSideDialogContext();

    const theme = useTheme();

    const path = navigationContext.resolveAliasesFrom(pathInput);

    const dataSource = useDataSource();

    const [selectedEntities, setSelectedEntities] = useState<Entity<any>[] | undefined>();

    /**
     * Fetch initially selected ids
     */
    useEffect(() => {
        let unmounted = false;
        if (selectedEntityIds && collection) {
            Promise.all(
                selectedEntityIds.map((entityId) => {
                    return dataSource.fetchEntity({
                        path,
                        entityId,
                        collection
                    });
                }))
                .then((entities) => {
                    if (!unmounted)
                        setSelectedEntities(entities.filter(e => e !== undefined) as Entity<any>[]);
                });
        } else {
            setSelectedEntities([]);
        }
        return () => {
            unmounted = true;
        };
    }, [dataSource, path, selectedEntityIds, collection]);

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
        } else {
            toggleEntitySelection(entity);
        }
    }, [multiselect, onSingleEntitySelected, toggleEntitySelection]);

    const tableRowActionsBuilder = useCallback(({
                                                    entity,
                                                    size
                                                }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntities && selectedEntities.map(e => e.id).indexOf(entity.id) > -1;
        return <CollectionRowActions
            entity={entity}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
        />;

    }, [multiselect, selectedEntityIds, toggleEntitySelection]);

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

                <Box sx={{ flexGrow: 1}}>
                {selectedEntities &&
                    <EntityCollectionTable path={path}
                                           collection={collection}
                                           onEntityClick={onEntityClick}
                                           tableRowActionsBuilder={tableRowActionsBuilder}
                                           Title={<Typography variant={"h6"}>
                                               {collection.singularName ? `Select ${collection.singularName}` : `Select from ${collection.name}`}
                                           </Typography>}
                                           inlineEditing={false}
                                           Actions={<Button onClick={onClear}
                                                            color="primary">
                                               Clear
                                           </Button>}
                                           entitiesDisplayedFirst={selectedEntities}
                    />}
                </Box>
                <CustomDialogActions translucent={false}>
                    <Button
                        onClick={(event) => {
                            event.stopPropagation();
                            sideDialogContext.close();
                            if (onClose)
                                onClose();
                        }}
                        color="primary"
                        variant="outlined">
                        Done
                    </Button>
                </CustomDialogActions>
            </Box>

    );

}
