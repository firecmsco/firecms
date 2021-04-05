import {
    CMSFormFieldProps,
    CollectionSize,
    Entity,
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

import { CollectionTableProps } from "../../collection/CollectionTableProps";
import { CollectionTable } from "../../collection/CollectionTable";
import { useColumnIds } from "../../collection/common";
import { CollectionRowActions } from "../../collection/CollectionRowActions";
import { useSchemasRegistry } from "../../side_dialog/SchemaRegistry";


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

    collectionPath: string;

    selectedEntityIds?: string[];

    onSingleEntitySelected?(entity: Entity<any> | null): void;

    onMultipleEntitiesSelected?(entities: Entity<any>[]): void;

    onClose(): void;

    CMSFormField: React.FunctionComponent<CMSFormFieldProps<any>>,

    CollectionTable: React.FunctionComponent<CollectionTableProps<any, any>>;

}


export function ReferenceDialog(
    {
        onSingleEntitySelected,
        onMultipleEntitiesSelected,
        onClose,
        open,
        multiselect,
        collectionPath,
        CMSFormField,
        CollectionTable,
        selectedEntityIds
    }: ReferenceDialogProps) {

    const classes = useStyles();

    const schemaRegistry = useSchemasRegistry();
    const collectionConfig = schemaRegistry.getCollectionConfig(collectionPath);
    if (!collectionConfig) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${collectionPath}`);
    }

    const schema = collectionConfig.schema;
    const textSearchDelegate = collectionConfig.textSearchDelegate;
    const filterableProperties = collectionConfig.filterableProperties;
    const initialFilter = collectionConfig.initialFilter;
    const displayedProperties = useColumnIds(collectionConfig, false);
    const paginationEnabled = collectionConfig.pagination === undefined || collectionConfig.pagination;

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


    const onEntityClick = (collectionPath: string, entity: Entity<any>) => {
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

    const tableRowWidgetBuilder = ({
                                       collectionPath,
                                       entity,
                                       size
                                   }: { collectionPath: string, entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntityIds && selectedEntityIds.indexOf(entity.id) > -1;
        return <CollectionRowActions
            entity={entity}
            collectionPath={collectionPath}
            size={size}
            isSelected={isSelected}
            selectionEnabled={multiselect}
            toggleEntitySelection={toggleEntitySelection}
            schema={schema}
            editEnabled={false}
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
                                 additionalColumns={collectionConfig.additionalColumns}
                                 title={<Typography
                                     variant={"h6"}>{`Select ${schema.name}`}</Typography>}
                                 displayedProperties={displayedProperties}
                                 filterableProperties={filterableProperties}
                                 textSearchDelegate={textSearchDelegate}
                                 initialFilter={initialFilter}
                                 initialSort={collectionConfig.initialSort}
                                 CMSFormField={CMSFormField}
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
