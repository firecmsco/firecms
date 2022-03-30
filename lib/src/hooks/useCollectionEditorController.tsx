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
    const [editedCollectionPath, setEditedCollectionPath] = React.useState< string  | undefined>();

    const openNewCollectionDialog = React.useCallback(({ group }) => {
        setNewCollectionDialog({ open: true, group });
    }, []);

    const closeNewCollectionDialog = React.useCallback(() => {
        setNewCollectionDialog({ open: false });
    }, []);

    return {
        editCollection: setEditedCollectionPath,
        openNewCollectionDialog,
        collectionEditorViews: (
            <>
                <CollectionEditorDialog
                    open={Boolean(editedCollectionPath)}
                    handleClose={(collection) => {
                        setEditedCollectionPath(undefined);
                    }}
                    path={editedCollectionPath}/>

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
