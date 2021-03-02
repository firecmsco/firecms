import React, { useState } from "react";
import {
    AdditionalColumnDelegate,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema
} from "../models";
import CollectionTable from "./CollectionTable";
import { CMSFormField } from "../form/form_factory";
import { Button, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";
import { CollectionRowActions } from "./CollectionRowActions";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { getSubcollectionColumnId, useColumnIds } from "./common";
import { useSideEntityController } from "../contexts";
import ExportButton from "./ExportButton";

type EntityCollectionProps<S extends EntitySchema<Key>, Key extends string> = {
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
export default function EntityCollectionTable<S extends EntitySchema<Key>, Key extends string>({
                                                                                                   collectionPath,
                                                                                                   collectionConfig
                                                                                               }: EntityCollectionProps<S, Key>
) {
    const selectedEntityController = useSideEntityController();

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("md"));

    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S, Key> | Entity<S, Key>[] | undefined>(undefined);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S, Key>[]>([]);

    const deleteEnabled = collectionConfig.deleteEnabled === undefined || collectionConfig.deleteEnabled;
    const exportable = collectionConfig.exportable === undefined || collectionConfig.exportable;
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

    const onEntityClick = inlineEditing ? undefined : (collectionPath: string, entity: Entity<S, Key>) => {
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

    const internalOnEntityDelete = (collectionPath: string, entity: Entity<S, Key>) => {
        setSelectedEntities(selectedEntities.filter((e) => e.id !== entity.id));
    };

    const internalOnMultipleEntitiesDelete = (collectionPath: string, entities: Entity<S, Key>[]) => {
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

    const toggleEntitySelection = (entity: Entity<S, Key>) => {
        let newValue;
        if (selectedEntities.indexOf(entity) > -1) {
            newValue = selectedEntities.filter((item: Entity<S, Key>) => item !== entity);
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

    function toolbarActionsBuilder({
                                       size,
                                       data
                                   }: { size: CollectionSize, data: Entity<any>[] }) {

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

        const exportButton = exportable &&
            <ExportButton schema={collectionConfig.schema}
                          collectionPath={collectionPath}/>;

        return (
            <>
                {extraActions}
                {multipleDeleteButton}
                {exportButton}
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
                CMSFormField={CMSFormField}
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
