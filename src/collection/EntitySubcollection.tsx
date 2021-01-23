import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { removeInitialSlash } from "../routes/navigation";
import { CollectionTable } from "./CollectionTable";
import { createFormField } from "../form/form_factory";
import { Box, Typography } from "@material-ui/core";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import React, { useState } from "react";

type EntitySubCollectionProps<S extends EntitySchema> = {
    entity: Entity<S>;
    subcollectionView: EntityCollectionView<any>;
    onSubcollectionEntityClick: (collectionPath: string, entity: Entity<S>) => void;
    tabsPosition: number;
    colIndex: number;
    context: "main" | "side"
}

export function EntityFormSubCollection<S extends EntitySchema>({
                                                                    entity,
                                                                    subcollectionView,
                                                                    onSubcollectionEntityClick,
                                                                    tabsPosition,
                                                                    colIndex,
                                                                    context
                                                                }: EntitySubCollectionProps<S>
) {
    const selectedEntityContext = useSelectedEntityContext();
    const collectionPath = entity ? `${entity?.reference.path}/${removeInitialSlash(subcollectionView.relativePath)}` : undefined;
    const onNewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        return collectionPath && selectedEntityContext.open({ collectionPath });
    };

    const deleteEnabled = subcollectionView.deleteEnabled === undefined || subcollectionView.deleteEnabled;
    const editEnabled = subcollectionView.editEnabled === undefined || subcollectionView.editEnabled;
    const inlineEditing = editEnabled && (subcollectionView.inlineEditing === undefined || subcollectionView.inlineEditing);
    const [selectedEntities, setSelectedEntities] = useState<Entity<S>[] | undefined>();

    const onEntityDelete = (collectionPath: string, entity: Entity<any>) =>
        subcollectionView.schema.onDelete && subcollectionView.schema.onDelete({
            schema: subcollectionView.schema,
            collectionPath,
            id: entity.id,
            entity
        });

    const onEntityClick = (collectionPath: string, clickedEntity: Entity<any>) =>
        onSubcollectionEntityClick(collectionPath, clickedEntity);

    const title = (
        <Typography variant={"caption"}
                    color={"textSecondary"}>
            {`/${collectionPath}`}
        </Typography>
    );

    const extraActions = subcollectionView.extraActions ? subcollectionView.extraActions({
        view: subcollectionView,
        selectedEntities
    }) : undefined;

    function onSelection(collectionPath: string, entities?: Entity<S>[]) {
        setSelectedEntities(entities);
    }

    return <Box
        key={`entity_detail_tab_content_${subcollectionView.name}`}
        role="tabpanel"
        flexGrow={1}
        height={"100%"}
        width={"100%"}
        hidden={tabsPosition !== colIndex + (context === "side" ? 1 : 0)}>
        {entity && collectionPath ?
            <CollectionTable
                collectionPath={collectionPath}
                schema={subcollectionView.schema}
                additionalColumns={subcollectionView.additionalColumns}
                defaultSize={subcollectionView.defaultSize}
                properties={subcollectionView.properties}
                excludedProperties={subcollectionView.excludedProperties}
                filterableProperties={subcollectionView.filterableProperties}
                initialFilter={subcollectionView.initialFilter}
                onSelection={onSelection}
                onEntityDelete={onEntityDelete}
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
