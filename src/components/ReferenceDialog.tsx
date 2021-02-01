import {
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema,
    fetchEntity
} from "../models";
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

import { FormFieldBuilder } from "../form";
import { CollectionTableProps } from "../collection/CollectionTableProps";
import { CollectionTable } from "../collection/CollectionTable";
import { useColumnIds } from "../collection/common";
import { CollectionRowActions } from "../collection/CollectionRowActions";


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


export interface ReferenceDialogProps<S extends EntitySchema> {

    open: boolean;

    multiselect: boolean;

    collectionPath: string;

    collectionView: EntityCollection<S>;

    onSingleEntitySelected?(entity: Entity<S> | null): void;

    selectedEntityIds?: string[];

    onMultipleEntitiesSelected?(entities: Entity<S>[]): void;

    onClose(): void;

    createFormField: FormFieldBuilder,

    CollectionTable: React.FunctionComponent<CollectionTableProps<S>>;

}


export function ReferenceDialog<S extends EntitySchema>(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        open,
        multiselect,
        collectionPath,
        collectionView,
        createFormField,
        CollectionTable,
        selectedEntityIds
    }: ReferenceDialogProps<S>) {

    const classes = useStyles();
    const schema = collectionView.schema;
    const textSearchDelegate = collectionView.textSearchDelegate;
    const filterableProperties = collectionView.filterableProperties;
    const initialFilter = collectionView.initialFilter;
    const displayedProperties = useColumnIds(collectionView, false);
    const paginationEnabled = collectionView.pagination === undefined || collectionView.pagination;

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[] | undefined>();

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


    const onEntityClick = (collectionPath: string, entity: Entity<S>) => {
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

    const toggleEntitySelection = (entity: Entity<S>) => {
        let newValue;
        if (selectedEntities) {
            if (selectedEntities.map((e) => e.id).indexOf(entity.id) > -1) {
                newValue = selectedEntities.filter((item: Entity<S>) => item.id !== entity.id);
            } else {
                newValue = [...selectedEntities, entity];
            }
            setSelectedEntities(newValue);

            if (onMultipleEntitiesSelected)
                onMultipleEntitiesSelected(newValue);
        }
    };

    const tableRowWidgetBuilder = ({
                                       collectionPath,
                                       entity,
                                       size
                                   }: { collectionPath: string, entity: Entity<S>, size: CollectionSize }) => {

        const isSelected = selectedEntityIds && selectedEntityIds.indexOf(entity.id) > -1;
        return <CollectionRowActions
            entity={entity}
            collectionPath={collectionPath}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
        />;

    };

    const toolbarWidgetBuilder = () => (
        <Button onClick={onClear}
                color="primary">
            Clear
        </Button>
    );

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
                                 toolbarWidgetBuilder={toolbarWidgetBuilder}
                                 onEntityClick={onEntityClick}
                                 tableRowWidgetBuilder={tableRowWidgetBuilder}
                                 paginationEnabled={paginationEnabled}
                                 title={<Typography
                                     variant={"h6"}>{`Select ${schema.name}`}</Typography>}
                                 displayedProperties={displayedProperties}
                                 filterableProperties={filterableProperties}
                                 textSearchDelegate={textSearchDelegate}
                                 initialFilter={initialFilter}
                                 initialSort={collectionView.initialSort}
                                 createFormField={createFormField}
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
