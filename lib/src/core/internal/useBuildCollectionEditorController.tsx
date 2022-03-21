import React from "react";
import {
    CollectionEditorController
} from "../../models/collection_editor_controller";

export const useBuildCollectionEditorController = (): CollectionEditorController => {

    const [newCollectionDialog, setNewCollectionDialog] = React.useState<{
        open: boolean,
        group?: string
    }>();
    const [editedCollectionPath, setEditCollectionPath] = React.useState<string | undefined>();

    const openNewCollectionDialog = React.useCallback(({ group }) => {
        setNewCollectionDialog({ open: true, group });
    }, []);

    const closeNewCollectionDialog = React.useCallback(() => {
        setNewCollectionDialog({ open: false });
    }, []);

    return {
        editedCollectionPath,
        editCollection: setEditCollectionPath,
        newCollectionDialog,
        openNewCollectionDialog,
        closeNewCollectionDialog,
    }
};
