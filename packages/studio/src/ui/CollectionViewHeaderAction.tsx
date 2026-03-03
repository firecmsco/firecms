import { EntityTableController, Property } from "@firecms/core";
import { IconButton, SettingsIcon, Tooltip } from "@firecms/ui";
import React from "react";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function CollectionViewHeaderAction({
                                               propertyKey,
                                               onHover,
                                               property,
                                               path,
                                               parentCollectionIds,
                                               collection,
                                               tableController
                                           }: {
    property: Property,
    propertyKey: string,
    onHover: boolean,
    path: string,
    parentCollectionIds: string[],
    collection: PersistedCollection;
    tableController: EntityTableController;
}) {

    const collectionEditorController = useCollectionEditorController();

    return (
        <Tooltip
            asChild={true}
            title={"Edit"}>
            <IconButton
                className={onHover ? "bg-white dark:bg-surface-950" : "hidden"}
                onClick={() => {
                    collectionEditorController.editProperty({
                        propertyKey,
                        property,
                        editedCollectionId: collection.slug,
                        parentCollectionIds,
                        collection,
                        existingEntities: tableController.data ?? []
                    });
                }}
                size={"small"}>
                <SettingsIcon size={"small"}/>
            </IconButton>
        </Tooltip>
    )
}
