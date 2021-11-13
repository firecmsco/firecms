import React, { useEffect, useState } from "react";
import { CollectionSize, Entity, EntityCollection } from "../../models";
import {
    Button,
    Dialog,
    DialogActions,
    Divider,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import { CollectionTable } from "./CollectionTable";
import { CollectionRowActions } from "./CollectionTable/internal/CollectionRowActions";
import { useDataSource } from "../../hooks";


export const useStyles = makeStyles(theme => createStyles({
    dialogBody: {
        flexGrow: 1,
        overflow: "auto",
        minWidth: "85vw"
    },
    paper: {
        height: "100%"
    }
}));

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
        path,
        selectedEntityIds
    }: ReferenceDialogProps) {

    const classes = useStyles();
    const dataSource = useDataSource();

    const schema = collection.schema;

    const [selectedEntities, setSelectedEntities] = useState<Entity<any>[] | undefined>();

    useEffect(() => {
        if (selectedEntityIds) {
            Promise.all(
                selectedEntityIds.map((entityId) => dataSource.fetchEntity({
                    path,
                    entityId,
                    schema
                })))
                .then((entities) => {
                    setSelectedEntities(entities);
                });
        } else {
            setSelectedEntities([]);
        }
    }, [selectedEntityIds]);


    const onEntityClick = (entity: Entity<any>) => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(entity);
        } else {
            toggleEntitySelection(entity);
        }
    };

    const onClear = () => {
        if (!multiselect && onSingleEntitySelected) {
            onSingleEntitySelected(null);
        } else if (onMultipleEntitiesSelected) {
            onMultipleEntitiesSelected([]);
        }
    };

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

    const toolbarActionsBuilder = () => (
        <Button onClick={onClear}
                color="primary">
            Clear
        </Button>
    );

    const title = (
        <Typography variant={"h6"}>
            {`Select ${schema.name}`}
        </Typography>);

    return (

        <Dialog
            onClose={onClose}
            classes={{
                paper: classes.paper
            }}
            maxWidth={"xl"}
            scroll={"paper"}
            open={open}>

            <div className={classes.dialogBody}>

                {selectedEntities &&
                <CollectionTable path={path}
                                 collection={collection}
                                 inlineEditing={false}
                                 toolbarActionsBuilder={toolbarActionsBuilder}
                                 onEntityClick={onEntityClick}
                                 tableRowActionsBuilder={tableRowActionsBuilder}
                                 title={title}
                                 entitiesDisplayedFirst={selectedEntities}
                />}
            </div>

            <Divider/>

            <DialogActions>
                <Button onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
                        color="primary"
                        variant="contained">
                    Close
                </Button>
            </DialogActions>

        </Dialog>

    );

}
