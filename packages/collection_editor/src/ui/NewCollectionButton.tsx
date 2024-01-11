import { AddIcon, Button } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionButton() {
    const collectionEditorController = useCollectionEditorController();
    return <Button className={"min-w-fit"}
                   variant={"outlined"}
                   onClick={() => collectionEditorController.createCollection({
                       parentCollectionIds: [],
                       redirect: true
                   })
                   }>
        <AddIcon/>
        New collection
    </Button>
}
