import {
    CollectionSize,
    Entity,
    EntityCollection,
    fetchEntity
} from "../../models";
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    Divider,
    makeStyles,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import React, { useEffect, useState } from "react";

import { CollectionTable } from "../../collection/CollectionTable";
import { useColumnIds } from "../../collection/common";
import { CollectionRowActions } from "../../collection/CollectionRowActions";


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


export interface ReferenceDialogProps {

    open: boolean;

    multiselect: boolean;

    collectionConfig: EntityCollection;

    collectionPath: string;

    selectedEntityIds?: string[];

    onSingleEntitySelected?(entity: Entity<any> | null): void;

    onMultipleEntitiesSelected?(entities: Entity<any>[]): void;

    onClose(): void;

}


export function ReferenceDialog(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        open,
        multiselect,
        collectionConfig,
        collectionPath,
        selectedEntityIds
    }: ReferenceDialogProps) {

    const classes = useStyles();

    const schema = collectionConfig.schema;
    const textSearchDelegate = collectionConfig.textSearchDelegate;
    const filterableProperties = collectionConfig.filterableProperties;
    const initialFilter = collectionConfig.initialFilter;
    const displayedProperties = useColumnIds(collectionConfig, false);
    const paginationEnabled = collectionConfig.pagination === undefined || Boolean(collectionConfig.pagination);
    const pageSize = typeof collectionConfig.pagination === "number" ? collectionConfig.pagination : undefined;

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [selectedEntities, setSelectedEntities] = useState<Entity<any>[] | undefined>();

    useEffect(() => {
        if (selectedEntityIds) {
            Promise.all(
                selectedEntityIds.map((id) => fetchEntity(collectionPath, id, schema)))
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
                <CollectionTable collectionPath={collectionPath}
                                 inlineEditing={false}
                                 schema={schema}
                                 toolbarActionsBuilder={toolbarActionsBuilder}
                                 onEntityClick={onEntityClick}
                                 tableRowActionsBuilder={tableRowActionsBuilder}
                                 paginationEnabled={paginationEnabled}
                                 defaultSize={collectionConfig.defaultSize}
                                 additionalColumns={collectionConfig.additionalColumns}
                                 title={title}
                                 pageSize={pageSize}
                                 displayedProperties={displayedProperties}
                                 filterableProperties={filterableProperties}
                                 textSearchDelegate={textSearchDelegate}
                                 initialFilter={initialFilter}
                                 initialSort={collectionConfig.initialSort}
                                 entitiesDisplayedFirst={selectedEntities}
                                 frozenIdColumn={largeLayout}
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
