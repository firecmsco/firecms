import { useContext } from "react";
import { CollectionEditorController } from "./types/collection_editor_controller";
import { CollectionEditorContext } from "./ConfigControllerProvider";

/**
 * Hook to access the collection editor controller.
 * The methods in this controller can be used to open the collection editor dialog.
 */
export const useCollectionEditorController = (): CollectionEditorController => useContext(CollectionEditorContext);
