import { removeInitialAndTrailingSlashes } from "../core/navigation";

export function getSidePanelKey(collectionPath: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(collectionPath)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(collectionPath);
}
