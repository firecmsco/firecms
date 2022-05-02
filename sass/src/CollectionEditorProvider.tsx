import React from "react";
import {
    CollectionEditorViewsController
} from "./collection_editor_controller";
import {
    CollectionEditorDialog
} from "./collection_editor/CollectionEditorDialog";
import {
    NewCollectionEditorDialog
} from "./collection_editor/NewCollectionEditorDialog";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "@camberi/firecms";

const DEFAULT_COLLECTIONS_CONTROLLER = {
    editCollection: {} as any,
    openNewCollectionDialog: {} as any,
    newCollectionDialog: {} as any,
    editedCollectionPath: {} as any,
    closeNewCollectionDialog: {} as any,
};


export const CollectionEditorContext = React.createContext<CollectionEditorViewsController>(DEFAULT_COLLECTIONS_CONTROLLER);


interface CollectionEditorsProviderProps {
    children: React.ReactNode;
}

export const CollectionEditorsProvider: React.FC<CollectionEditorsProviderProps> = ({ children }) => {

    const navigationContext = useNavigationContext();
    const navigate = useNavigate();

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

    return (
        <CollectionEditorContext.Provider
            value={{
                editCollection: setEditedCollectionPath,
                openNewCollectionDialog,
                newCollectionDialog,
                editedCollectionPath,
                closeNewCollectionDialog
            }}
        >
            {children}

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
                        navigate(navigationContext.buildUrlCollectionPath(collection.alias ?? collection.path));
                    }
                    closeNewCollectionDialog();
                }}/>

        </CollectionEditorContext.Provider>
    );
};
