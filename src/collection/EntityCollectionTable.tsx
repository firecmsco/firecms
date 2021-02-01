import React, { useState } from "react";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema
} from "../models";
import { CollectionTable } from "./CollectionTable";
import { createFormField } from "../form/form_factory";
import { Button, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";
import { CollectionRowActions } from "./CollectionRowActions";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { getSubcollectionColumnId, useColumnIds } from "./common";
import { useSideEntityController } from "../side_dialog/SideEntityContext";

type EntitySubCollectionProps<S extends EntitySchema> = {
    collectionPath: string;
    view: EntityCollection<any>;
}

export function EntityCollectionTable<S extends EntitySchema>({
                                                                  collectionPath,
                                                                  view
                                                              }: EntitySubCollectionProps<S>
) {
    const selectedEntityContext = useSideEntityController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | Entity<S>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[]>([]);

    const deleteEnabled = view.deleteEnabled === undefined || view.deleteEnabled;
    const editEnabled = view.editEnabled === undefined || view.editEnabled;
    const inlineEditing = editEnabled && (view.inlineEditing === undefined || view.inlineEditing);
    const selectionEnabled = view.selectionEnabled === undefined || view.selectionEnabled;
    const paginationEnabled = view.pagination === undefined || view.pagination;
    const displayedProperties = useColumnIds(view, true);

    const subcollectionColumns: AdditionalColumnDelegate<any>[] = view.subcollections?.map((subcollection) => {
        return {
            id: getSubcollectionColumnId(subcollection),
            title: subcollection.name,
            width: 200,
            builder: (entity: Entity<any>) => (
                <Button color={"primary"}
                        onClick={(event) => {
                            event.stopPropagation();
                            selectedEntityContext.open({
                                collectionPath: collectionPath,
                                entityId: entity.id,
                                selectedSubcollection: subcollection.relativePath
                            });
                        }}>
                    {subcollection.name}
                </Button>
            )
        };
    }) ?? [];

    const additionalColumns = [...view.additionalColumns ?? [], ...subcollectionColumns];

    const onEntityClick = inlineEditing ? undefined : (collectionPath: string, entity: Entity<S>) => {
        selectedEntityContext.open({
            entityId: entity.id,
            collectionPath
        });
    };

    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return collectionPath && selectedEntityContext.open({ collectionPath });
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
                {`${view.schema.name} list`}
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
                Add {view.schema.name}
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

        const extraActions = view.extraActions ? view.extraActions({
            view: view,
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
                schema={view.schema}
                additionalColumns={additionalColumns}
                defaultSize={view.defaultSize}
                displayedProperties={displayedProperties}
                filterableProperties={view.filterableProperties}
                initialFilter={view.initialFilter}
                initialSort={view.initialSort}
                inlineEditing={inlineEditing}
                onEntityClick={onEntityClick}
                textSearchDelegate={view.textSearchDelegate}
                tableRowWidgetBuilder={tableRowButtonsBuilder}
                paginationEnabled={paginationEnabled}
                toolbarWidgetBuilder={toolbarActionsBuilder}
                title={title}
                createFormField={createFormField}
                frozenIdColumn={largeLayout}
            />

            <DeleteEntityDialog entityOrEntitiesToDelete={deleteEntityClicked}
                                collectionPath={collectionPath}
                                schema={view.schema}
                                open={!!deleteEntityClicked}
                                onEntityDelete={internalOnEntityDelete}
                                onMultipleEntitiesDelete={internalOnMultipleEntitiesDelete}
                                onClose={() => setDeleteEntityClicked(undefined)}/>
        </>
    );
}
