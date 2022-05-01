import React from "react";
import {
    CollectionEditorController
} from "../models/collection_editor_controller";
import {
    CollectionEditorDialog
} from "./CollectionEditorDialog";
import {
    NewCollectionEditorDialog
} from "./NewCollectionEditorDialog";
import { useNavigationContext } from "../hooks";
import { useNavigate } from "react-router-dom";
import { useCollectionsController } from "../hooks/useCollectionsController";

export const useBuildCollectionEditorController = (): CollectionEditorController => {

    const [newCollectionDialog, setNewCollectionDialog] = React.useState<{
        open: boolean,
        group?: string
    }>();
    const [editedCollectionPath, setEditedCollectionPath] = React.useState<string | undefined>();

    const openNewCollectionDialog = React.useCallback(({ group }) => {
        setNewCollectionDialog({ open: true, group });
    }, []);

    const closeNewCollectionDialog = React.useCallback(() => {
        setNewCollectionDialog({ open: false });
    }, []);

    return {
        editCollection: setEditedCollectionPath,
        openNewCollectionDialog,
        newCollectionDialog,
        editedCollectionPath,
        closeNewCollectionDialog
    }
};
