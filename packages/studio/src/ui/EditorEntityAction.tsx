import {
    useAuthController,
    useCollectionRegistryController,
    useTranslation
} from "@rebasepro/core";
import { PluginFormActionProps } from "@rebasepro/types";
import { IconButton, SettingsIcon, Tooltip, } from "@rebasepro/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorEntityAction({
    path,
    parentCollectionIds,
    collection,
    formContext
}: PluginFormActionProps) {

    const authController = useAuthController();
    const collectionRegistry = useCollectionRegistryController();
    const collectionEditorController = useCollectionEditorController();
    const { t } = useTranslation();

    const parentCollection = parentCollectionIds.length > 0 ? collectionRegistry.getCollection(parentCollectionIds[parentCollectionIds.length - 1]) : undefined;

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    const isDirty = formContext?.formex.dirty ?? false;

    const editorButton = <Tooltip
        asChild={true}
        title={canEditCollection ? (isDirty ? t("studio_editor_entity_save_first") : t("studio_editor_entity_edit_schema")) : t("studio_editor_entity_no_permission")}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection || isDirty}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({
                    id: collection.slug,
                    path,
                    parentCollectionIds,
                    parentCollection: parentCollection as PersistedCollection,
                })
                : undefined}>
            <SettingsIcon size={"small"} />
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}
