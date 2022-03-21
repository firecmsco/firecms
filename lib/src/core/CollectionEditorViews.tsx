import React from "react";
import { useNavigate } from "react-router-dom";
import {
    CollectionEditorDialog
} from "../collection_editor/CollectionEditorDialog";
import {
    NewCollectionEditorDialog
} from "../collection_editor/NewCollectionEditorDialog";
import { useNavigationContext } from "../hooks";

import {
    useCollectionEditorController
} from "../hooks/useCollectionEditorController";

export function CollectionEditorViews() {

    const collectionEditorController = useCollectionEditorController();
    const navigationContext = useNavigationContext();
    const navigate = useNavigate();

    if (!collectionEditorController) return null;

    const {
        editedCollectionPath,
        editCollection,
        newCollectionDialog,
        closeNewCollectionDialog
    } = collectionEditorController;

    return (
        <>
            <CollectionEditorDialog
                open={Boolean(editedCollectionPath)}
                handleClose={(collection) => {
                    editCollection(undefined);
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
    );
}
