import React, { useCallback, useEffect, useState } from "react";
import { CollectionSize, Entity, EntityCollection } from "../../models";
import { Box, Button, Dialog, Typography } from "@mui/material";

import { CollectionTable } from "./CollectionTable";
import {
    CollectionRowActions
} from "./CollectionTable/internal/CollectionRowActions";
import { useDataSource, useNavigationContext } from "../../hooks";
import { ErrorView } from "./ErrorView";
import { CustomDialogActions } from "./CustomDialogActions";

/**
 * @category Components
 */
export interface ReferenceDialogProps {

    /**
     * Is the dialog currently open
     */
    open: boolean;

    /**
     * Allow multiple selection of values
     */
    multiselect: boolean;

    /**
     * Entity collection config
     */
    collection: EntityCollection;

    /**
     * Absolute path of the collection
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
    onClose(): void;

}

/**
 * This component renders an overlay dialog that allows to select entities
 * in a given collection
 * @category Components
 */
export function ReferenceDialog(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        open,
        multiselect,
        collection,
        path: pathInput,
        selectedEntityIds
    }: ReferenceDialogProps) {

    const navigationContext = useNavigationContext();

    const path = navigationContext.resolveAliasesFrom(pathInput);

    const dataSource = useDataSource();

    const [selectedEntities, setSelectedEntities] = useState<Entity<any>[] | undefined>();

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

    const onEntityClick = (entity: Entity<any>) => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(entity);
        } else {
            toggleEntitySelection(entity);
        }
    };

    const onClear = useCallback(() => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(null);
        } else if (onMultipleEntitiesSelected) {
            onMultipleEntitiesSelected([]);
        }
    }, [multiselect, onMultipleEntitiesSelected, onSingleEntitySelected]);

    const toggleEntitySelection = (entity: Entity<any>) => {
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
    };

    const tableRowActionsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntityIds && selectedEntityIds.indexOf(entity.id) > -1;
        return <CollectionRowActions
            entity={entity}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
        />;

    };

    if (!collection) {
        return <ErrorView
            error={"Could not find collection with id " + collection}/>
    }

    return (
        <Dialog
            keepMounted={false}
            onClose={onClose}
            PaperProps={{
                sx: (theme) => ({
                    height: "90vh",
                    minWidth: "85vw"
                })
            }}
            maxWidth={"xl"}
            scroll={"paper"}
            open={open}>

            <Box sx={{
                flexGrow: 1,
                overflow: "auto"
            }}>

                {selectedEntities &&
                    <CollectionTable path={path}
                                     collection={collection}
                                     onEntityClick={onEntityClick}
                                     tableRowActionsBuilder={tableRowActionsBuilder}
                                     Title={<Typography variant={"h6"}>
                                         {`Select ${collection.name}`}
                                     </Typography>}
                                     inlineEditing={false}
                                     Actions={<Button onClick={onClear}
                                                      color="primary">
                                         Clear
                                     </Button>}
                                     entitiesDisplayedFirst={selectedEntities}
                    />}
            </Box>

            <CustomDialogActions>
                <Button
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                    }}
                    color="primary"
                    variant="outlined">
                    Done
                </Button>
            </CustomDialogActions>

        </Dialog>
    );

}
