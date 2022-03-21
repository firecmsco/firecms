import React from "react";
import {
    CollectionEditorController
} from "../models/collection_editor_controller";
import {
    CollectionEditorDialog
} from "../collection_editor/CollectionEditorDialog";
import {
    NewCollectionEditorDialog
} from "../collection_editor/NewCollectionEditorDialog";
import { useNavigationContext } from "./index";
import { useNavigate } from "react-router-dom";

export const useCollectionEditorController = (): CollectionEditorController => {

    const navigationContext = useNavigationContext();
    const navigate = useNavigate();

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
        collectionEditorViews: (
            <>
                <CollectionEditorDialog
                    open={Boolean(editedCollectionPath)}
                    handleClose={(collection) => {
                        setEditCollectionPath(undefined);
                    }}
                    path={editedCollectionPath as string}/>

                <NewCollectionEditorDialog
                    open={false}
                    {...newCollectionDialog}
                    handleClose={(collection) => {
                        if (collection) {
                            navigate(navigationContext.buildUrlCollectionPath(collection.path));
                        }
                        closeNewCollectionDialog();
                    }}/>
            </>
        )
    }
};
