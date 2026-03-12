import { PluginFormActionProps, useAuthController, useNavigationController, useTranslation } from "@firecms/core";
import { IconButton, SettingsIcon, Tooltip, } from "@firecms/ui";

import { useCollectionEditorController } from "../useCollectionEditorController";
import { PersistedCollection } from "../types/persisted_collection";

export function EditorEntityAction({
                                       path: fullPath,
                                       parentCollectionIds,
                                       collection,
                                       formContext
                                   }: PluginFormActionProps) {

    const authController = useAuthController();
    const navigationController = useNavigationController();
    const collectionEditorController = useCollectionEditorController();
    const { t } = useTranslation();

    const parentCollection = navigationController.getCollectionFromIds(parentCollectionIds);

    const canEditCollection = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        }).editCollections
        : true;

    const isDirty = formContext?.formex.dirty ?? false;

    const editorButton = <Tooltip
        asChild={true}
        title={canEditCollection ? (isDirty ? t("save_before_changing_schema") : t("edit_schema_for_this_form")) : t("no_permissions_to_edit_collection")}>
        <IconButton
            color={"primary"}
            disabled={!canEditCollection || isDirty}
            onClick={canEditCollection
                ? () => collectionEditorController?.editCollection({
                    id: collection.id,
                    fullPath,
                    parentCollectionIds,
                    parentCollection: parentCollection as PersistedCollection,
                })
                : undefined}>
            <SettingsIcon size={"small"}/>
        </IconButton>
    </Tooltip>;

    return <>
        {editorButton}
    </>

}
