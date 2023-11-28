import { EntityCollection, IconButton, ResolvedProperty, SettingsIcon, Tooltip } from "@firecms/core";
import React from "react";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function CollectionViewHeaderAction({
                                               propertyKey,
                                               onHover,
                                               property,
                                               fullPath,
                                               parentPathSegments,
                                               collection
                                           }: {
    property: ResolvedProperty,
    propertyKey: string,
    onHover: boolean,
    fullPath: string,
    parentPathSegments: string[],
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
                        parentPathSegments,
                        collection
                    });
                }}
                size={"small"}>
                <SettingsIcon size={"small"}/>
            </IconButton>
        </Tooltip>
    )
}
