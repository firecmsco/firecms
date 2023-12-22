import { IconButton, ResolvedProperty, SettingsIcon, Tooltip } from "@firecms/core";
import React from "react";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function CollectionViewHeaderAction({
                                               propertyKey,
                                               onHover,
                                               property,
                                               fullPath,
                                               parentCollectionIds,
                                               collection
                                           }: {
    property: ResolvedProperty,
    propertyKey: string,
    onHover: boolean,
    fullPath: string,
    parentCollectionIds: string[],
    collection: PersistedCollection;
}) {

    const collectionEditorController = useCollectionEditorController();

    return (
        <Tooltip title={"Edit"}>
            <IconButton
                className={onHover ? "bg-white dark:bg-gray-950" : "hidden"}
                onClick={() => {
                    collectionEditorController.editProperty({
                        propertyKey,
                        property,
                        editedCollectionPath: fullPath,
                        parentCollectionIds,
                        collection
                    });
                }}
                size={"small"}>
                <SettingsIcon size={"small"}/>
            </IconButton>
        </Tooltip>
    )
}
