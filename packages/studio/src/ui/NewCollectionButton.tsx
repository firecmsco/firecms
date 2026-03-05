import { AddIcon, Button } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { useAdminModeController } from "@firecms/core";

export function NewCollectionButton() {
    const adminModeController = useAdminModeController();
    const collectionEditorController = useCollectionEditorController();

    if (adminModeController.mode === "studio") {
        return null;
    }

    return <div className={"bg-surface-50 dark:bg-surface-900 min-w-fit rounded-xs"}>
        <Button className={"min-w-fit"}

            onClick={() => collectionEditorController.createCollection({
                parentCollectionIds: [],
                redirect: true,
                sourceClick: "new_collection_button"
            })}>
            <AddIcon />
            New collection
        </Button>
    </div>
}
