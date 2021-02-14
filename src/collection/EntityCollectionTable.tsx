import React, { useState } from "react";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema
} from "../models";
import CollectionTable from "./CollectionTable";
import { createFormField } from "../form/form_factory";
import { Button, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";
import { CollectionRowActions } from "./CollectionRowActions";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { getSubcollectionColumnId, useColumnIds } from "./common";
import { useSideEntityController } from "../contexts/SideEntityController";

type EntitySubCollectionProps<S extends EntitySchema> = {
    collectionPath: string;
    collectionConfig: EntityCollection<any>;
}

/**
 * This component is in charge of binding a Firestore path with an {@link EntityCollection}
 * where it's configuration is defined. This is useful if you have defined already
 * your entity collections and need to build a custom component.
 *
 * If you need a lower level implementation with more granular options, you
 * can try CollectionTable, which still does data fetching from Firestore.
 *
 * @param collectionPath
 * @param collectionConfig
 * @constructor
 */
export default function EntityCollectionTable<S extends EntitySchema>({
                                                                          collectionPath,
                                                                          collectionConfig
                                                                      }: EntitySubCollectionProps<S>
) {
    const selectedEntityController = useSideEntityController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | Entity<S>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[]>([]);

    const deleteEnabled = collectionConfig.deleteEnabled === undefined || collectionConfig.deleteEnabled;
    const editEnabled = collectionConfig.editEnabled === undefined || collectionConfig.editEnabled;
    const inlineEditing = editEnabled && (collectionConfig.inlineEditing === undefined || collectionConfig.inlineEditing);
    const selectionEnabled = collectionConfig.selectionEnabled === undefined || collectionConfig.selectionEnabled;
    const paginationEnabled = collectionConfig.pagination === undefined || collectionConfig.pagination;
    const displayedProperties = useColumnIds(collectionConfig, true);

    const subcollectionColumns: AdditionalColumnDelegate<any>[] = collectionConfig.subcollections?.map((subcollection) => {
        return {
            id: getSubcollectionColumnId(subcollection),
            title: subcollection.name,
            width: 200,
            builder: (entity: Entity<any>) => (
                <Button color={"primary"}
                        onClick={(event) => {
                            event.stopPropagation();
                            selectedEntityController.open({
                                collectionPath: collectionPath,
                                entityId: entity.id,
                                selectedSubcollection: subcollection.relativePath,
                                editEnabled: editEnabled,
                                schema: collectionConfig.schema,
                                subcollections: collectionConfig.subcollections,
                                overrideSchemaResolver: false
                            });
                        }}>
                    {subcollection.name}
                </Button>
            )
        };
    }) ?? [];

    const additionalColumns = [...collectionConfig.additionalColumns ?? [], ...subcollectionColumns];

    const onEntityClick = inlineEditing ? undefined : (collectionPath: string, entity: Entity<S>) => {
        selectedEntityController.open({
            entityId: entity.id,
            collectionPath,
            editEnabled: collectionConfig.editEnabled == undefined || collectionConfig.editEnabled,
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
            overrideSchemaResolver: false
        });
    };

    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return collectionPath && selectedEntityController.open({
            collectionPath,
            editEnabled: collectionConfig.editEnabled == undefined || collectionConfig.editEnabled,
            schema: collectionConfig.schema,
            subcollections: collectionConfig.subcollections,
            overrideSchemaResolver: false
        });
    };

    const internalOnEntityDelete = (collectionPath: string, entity: Entity<S>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (collectionPath: string, entities: Entity<S>[]) => {
        setSelectedEntities([]);
    };

    const title = (
        <>
            <Typography variant="h6">
                {`${collectionConfig.schema.name} list`}
            </Typography>
            <Typography variant={"caption"} color={"textSecondary"}>
                {`/${collectionPath}`}
            </Typography>
        </>
    );

    const toggleEntitySelection = (entity: Entity<S>) => {
        let newValue;
        if (selectedEntities.indexOf(entity) > -1) {
            newValue = selectedEntities.filter((item: Entity<S>) => item !== entity);
        } else {
            newValue = [...selectedEntities, entity];
        }
        setSelectedEntities(newValue);
    };

    const tableRowButtonsBuilder = ({
                                        entity,
                                        size
                                    }: { entity: Entity<any>, size: CollectionSize }) => {

        const isSelected = selectedEntities.indexOf(entity) > -1;

        return (
            <CollectionRowActions
                entity={entity}
                isSelected={isSelected}
                collectionPath={collectionPath}
                editEnabled={editEnabled}
                deleteEnabled={deleteEnabled}
                selectionEnabled={selectionEnabled}
                size={size}
                toggleEntitySelection={toggleEntitySelection}
                onDeleteClicked={setDeleteEntityClicked}
                schema={collectionConfig.schema}
                subcollections={collectionConfig.subcollections}
            />
        );

    };

    function toolbarActionsBuilder({ size }: { size: CollectionSize }) {

        const addButton = editEnabled && onNewClick && (largeLayout ?
            <Button
                onClick={onNewClick}
                startIcon={<Add/>}
                size="large"
                variant="contained"
                color="primary">
                Add {collectionConfig.schema.name}
            </Button>
            : <Button
                onClick={onNewClick}
                size="medium"
                variant="contained"
                color="primary"
            >
                <Add/>
            </Button>);

        const multipleDeleteButton = selectionEnabled && deleteEnabled &&
            <Button
                disabled={!(selectedEntities?.length)}
                startIcon={<Delete/>}
                onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    setDeleteEntityClicked(selectedEntities);
                }}
                color={"primary"}
            >
                <p style={{ minWidth: 24 }}>({selectedEntities?.length})</p>
            </Button>;

        const extraActions = collectionConfig.extraActions ? collectionConfig.extraActions({
            view: collectionConfig,
            selectedEntities
        }) : undefined;

        return (
            <>
                {extraActions}
                {multipleDeleteButton}
                {addButton}
            </>
        );
    }

    return (<>

            <CollectionTable
                collectionPath={collectionPath}
                schema={collectionConfig.schema}
                additionalColumns={additionalColumns}
                defaultSize={collectionConfig.defaultSize}
                displayedProperties={displayedProperties}
                filterableProperties={collectionConfig.filterableProperties}
                initialFilter={collectionConfig.initialFilter}
                initialSort={collectionConfig.initialSort}
                inlineEditing={inlineEditing}
                onEntityClick={onEntityClick}
                textSearchDelegate={collectionConfig.textSearchDelegate}
                tableRowWidgetBuilder={tableRowButtonsBuilder}
                paginationEnabled={paginationEnabled}
                toolbarWidgetBuilder={toolbarActionsBuilder}
                title={title}
                createFormField={createFormField}
                frozenIdColumn={largeLayout}
            />

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                collectionPath={collectionPath}
                                schema={collectionConfig.schema}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>
        </>
    );
}

export { EntityCollectionTable };
