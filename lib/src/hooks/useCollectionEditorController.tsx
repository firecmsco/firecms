import React from "react";
import {
    CollectionEditorController
} from "../models/collection_editor_controller";
import { useFireCMSContext } from "./index";

export const useCollectionEditorController = (): CollectionEditorController | undefined => {
    const context = useFireCMSContext();
    return context.collectionEditorController;
};
