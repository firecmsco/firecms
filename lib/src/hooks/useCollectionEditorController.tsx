import { useFireCMSContext } from "./useFireCMSContext";
import {
    CollectionEditorController
} from "../models/collection_editor_controller";

/**
 * @category Hooks and utilities
 */
export function useCollectionEditorController(): CollectionEditorController | undefined {
    const context = useFireCMSContext();
    return context.collectionEditorController;
}
