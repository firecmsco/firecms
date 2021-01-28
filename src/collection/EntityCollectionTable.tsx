import {
    CollectionSize,
    Entity,
    EntityCollectionView,
    EntitySchema
} from "../models";
import { CollectionTable } from "./CollectionTable";
import { createFormField } from "../form/form_factory";
import { Button, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import React, { useState } from "react";
import { Add, Delete } from "@material-ui/icons";
import { CollectionRowActions } from "./CollectionRowActions";
import DeleteEntityDialog from "./DeleteEntityDialog";

type EntitySubCollectionProps<S extends EntitySchema> = {
    collectionPath: string;
    view: EntityCollectionView<any>;
}

export function EntityCollectionTable<S extends EntitySchema>({
                                                                  collectionPath,
                                                                  view
                                                              }: EntitySubCollectionProps<S>
) {
    const selectedEntityContext = useSelectedEntityContext();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | Entity<S>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[]>([]);

    const deleteEnabled = view.deleteEnabled === undefined || view.deleteEnabled;
    const editEnabled = view.editEnabled === undefined || view.editEnabled;
    const inlineEditing = editEnabled && (view.inlineEditing === undefined || view.inlineEditing);
    const selectionEnabled = view.selectionEnabled === undefined || view.selectionEnabled;
    const paginationEnabled = view.pagination === undefined || view.pagination;

    const onEntityClick = (collectionPath: string, entity: Entity<S>) => {
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
                additionalColumns={view.additionalColumns}
                defaultSize={view.defaultSize}
                properties={view.properties}
                excludedProperties={view.excludedProperties}
                filterableProperties={view.filterableProperties}
                initialFilter={view.initialFilter}
                initialSort={view.initialSort}
                editEnabled={editEnabled}
                inlineEditing={inlineEditing}
                deleteEnabled={deleteEnabled}
                onEntityClick={onEntityClick}
                tableRowWidgetBuilder={tableRowButtonsBuilder}
                paginationEnabled={paginationEnabled}
                toolbarWidgetBuilder={toolbarActionsBuilder}
                title={title}
                createFormField={createFormField}
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
