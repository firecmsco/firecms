import React from "react";
import { PluginFormActionProps } from "@firecms/core";
import { LastEditedByIndicator } from "./LastEditedByIndicator";

/**
 * Renders the "last edited by" indicator in the entity form top bar.
 * Used as a plugin `form.ActionsTop` component.
 */
export function LastEditedByFormAction({
    entityId,
    path,
    status,
    collection,
}: PluginFormActionProps) {
    if (status === "new" || status === "copy" || !entityId) return null;
    if (!collection.history) return null;

    return <LastEditedByIndicator
        path={path}
        entityId={entityId}
        collection={collection}
    />;
}
