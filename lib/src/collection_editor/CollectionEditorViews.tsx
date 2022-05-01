import React from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "../hooks";
import { useCollectionsController } from "../hooks/useCollectionsController";
import { CollectionEditorDialog } from "./CollectionEditorDialog";
import { NewCollectionEditorDialog } from "./NewCollectionEditorDialog";
import {
    useCollectionEditorController
} from "../hooks/useCollectionEditorController";

export type CollectionEditorViewsProps<M> = {};

export function CollectionEditorViews<M>({}: CollectionEditorViewsProps<M>) {

    const navigate = useNavigate();
    const navigationContext = useNavigationContext();
    const collectionEditorController = useCollectionEditorController();

    return <>
        {collectionEditorController && <CollectionEditorDialog
            open={Boolean(collectionEditorController.editedCollectionPath)}
            handleClose={(collection) => {
                collectionEditorController.editCollection(undefined);
            }}
            path={collectionEditorController.editedCollectionPath}/>}

        {collectionEditorController && <NewCollectionEditorDialog
            open={false}
            {...collectionEditorController.newCollectionDialog}
            handleClose={(collection) => {
                if (collection) {
                    navigate(navigationContext.buildUrlCollectionPath(collection.alias ?? collection.path));
                }
                collectionEditorController.closeNewCollectionDialog();
            }}/>}
    </>
}
