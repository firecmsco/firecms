import React from "react";
import { EntityCollection, useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

/**
 * Component rendered when Kanban view is missing orderProperty configuration.
 * Provides a CTA button to open the collection editor to configure Kanban.
 */
export function KanbanSetupAction({
    collection,
    fullPath,
    parentCollectionIds
}: {
    collection: EntityCollection;
    fullPath: string;
    parentCollectionIds: string[];
}) {
    const collectionEditorController = useCollectionEditorController();

    const handleConfigureClick = () => {
        collectionEditorController.editCollection({
            id: collection.id,
            parentCollectionIds,
            initialView: "general",
            expandKanban: true
        });
    };

    return (
        <Button
            variant="outlined"
            onClick={handleConfigureClick}
        >
            Configure Kanban
        </Button>
    );
}
