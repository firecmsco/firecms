import { AddIcon, Button } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionButton() {
    const collectionEditorController = useCollectionEditorController();
    return <Button className={"min-w-fit"}
                   variant={"outlined"}
                   onClick={() => collectionEditorController.createCollection({
                       parentCollectionIds: [],
                       redirect: true,
                       sourceClick: "new_collection_button"
                   })}>
        <AddIcon/>
        New collection
    </Button>
}
