import React, { useContext } from "react";
import {
    CollectionEditorViewsController
} from "./models/collection_editor_controller";
import { CollectionEditorContext } from "./CollectionEditorProvider";

export const useCollectionEditorController = (): CollectionEditorViewsController => useContext(CollectionEditorContext);
