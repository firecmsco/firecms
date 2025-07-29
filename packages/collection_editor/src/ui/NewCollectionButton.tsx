import { AddIcon, Button } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionButton() {
    const collectionEditorController = useCollectionEditorController();
    return <div className={"bg-surface-50 dark:bg-surface-900 min-w-fit rounded-xs"}>
        <Button className={"min-w-fit"}
                variant={"outlined"}
                onClick={() => collectionEditorController.createCollection({
                    parentCollectionIds: [],
                    redirect: true,
                    sourceClick: "new_collection_button"
                })}>
            <AddIcon/>
            New collection
        </Button>
    </div>
}
