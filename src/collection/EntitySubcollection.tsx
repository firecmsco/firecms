import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { removeInitialSlash } from "../routes/navigation";
import { CollectionTable } from "./CollectionTable";
import { createFormField } from "../form/form_factory";
import { Box, Typography } from "@material-ui/core";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import React, { useState } from "react";

type EntitySubCollectionProps<S extends EntitySchema> = {
    entity: Entity<S>;
    view: EntityCollectionView<any>;
    onSubcollectionEntityClick: (collectionPath: string, entity: Entity<S>) => void;
    tabsPosition: number;
    colIndex: number;
    context: "main" | "side"
}

export function EntityFormSubCollection<S extends EntitySchema>({
                                                                    entity,
                                                                    view,
                                                                    onSubcollectionEntityClick,
                                                                    tabsPosition,
                                                                    colIndex,
                                                                    context
                                                                }: EntitySubCollectionProps<S>
) {
    const selectedEntityContext = useSelectedEntityContext();
    const collectionPath = entity ? `${entity?.reference.path}/${removeInitialSlash(view.relativePath)}` : undefined;
    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return collectionPath && selectedEntityContext.open({ collectionPath });
    };

    const deleteEnabled = view.deleteEnabled === undefined || view.deleteEnabled;
    const editEnabled = view.editEnabled === undefined || view.editEnabled;
    const inlineEditing = editEnabled && (view.inlineEditing === undefined || view.inlineEditing);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[] | undefined>();

    const onEntityPreDelete = (collectionPath: string, entity: Entity<any>) =>
        view.schema.onDelete && view.schema.onPreDelete({
            schema: view.schema,
            collectionPath,
            id: entity.id,
            entity
        });

    const onEntityDelete = (collectionPath: string, entity: Entity<any>) =>
        view.schema.onDelete && view.schema.onDelete({
            schema: view.schema,
            collectionPath,
            id: entity.id,
            entity
        });

    const onMultipleEntitiesDelete = (collectionPath: string, entities: Entity<any>[]) =>
        view.schema.onDelete &&
        entities.forEach((entity) => view.schema.onDelete({
            schema: view.schema,
            collectionPath,
            id: entity.id,
            entity
        }));

    const onEntityClick = (collectionPath: string, clickedEntity: Entity<any>) =>
        onSubcollectionEntityClick(collectionPath, clickedEntity);

    const title = (
        <Typography variant={"caption"}
                    color={"textSecondary"}>
            {`/${collectionPath}`}
        </Typography>
    );

    const extraActions = view.extraActions ? view.extraActions({
        view: view,
        selectedEntities
    }) : undefined;

    function onSelection(collectionPath: string, entities?: Entity<S>[]) {
        setSelectedEntities(entities);
    }

    return <Box
        key={`entity_detail_tab_content_${view.name}`}
        role="tabpanel"
        flexGrow={1}
        height={"100%"}
        width={"100%"}
        hidden={tabsPosition !== colIndex + (context === "side" ? 1 : 0)}>
        {entity && collectionPath ?
            <CollectionTable
                collectionPath={collectionPath}
                schema={view.schema}
                additionalColumns={view.additionalColumns}
                defaultSize={view.defaultSize}
                properties={view.properties}
                excludedProperties={view.excludedProperties}
                filterableProperties={view.filterableProperties}
                initialFilter={view.initialFilter}
                onSelection={onSelection}
                onEntityDelete={onEntityDelete}
                onMultipleEntitiesDelete={onMultipleEntitiesDelete}
                editEnabled={editEnabled}
                inlineEditing={inlineEditing}
                deleteEnabled={deleteEnabled}
                onEntityClick={onEntityClick}
                includeToolbar={true}
                paginationEnabled={false}
                extraActions={extraActions}
                title={title}
                onNewClick={onNewClick}
                createFormField={createFormField}
            />
            :
            <Box m={3}
                 display={"flex"}
                 alignItems={"center"}
                 justifyContent={"center"}>
                <Box>
                    You need to save your entity before
                    adding
                    additional collections
                </Box>
            </Box>
        }
    </Box>;
}
