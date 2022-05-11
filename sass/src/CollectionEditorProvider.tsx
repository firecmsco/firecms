import React from "react";
import {
    CollectionEditorViewsController
} from "./models/collection_editor_controller";
import {
    CollectionEditorDialog
} from "./collection_editor/CollectionEditorDialog";
import {
    NewCollectionEditorDialog
} from "./collection_editor/NewCollectionEditorDialog";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "@camberi/firecms";
import { ConfigPermissions } from "./config_permissions";

const DEFAULT_COLLECTIONS_CONTROLLER = {
    editCollection: {} as any,
    openNewCollectionDialog: {} as any,
    newCollectionDialog: {} as any,
    editedCollectionPath: {} as any,
    closeNewCollectionDialog: {} as any,
    configPermissions: {} as any
};


export const CollectionEditorContext = React.createContext<CollectionEditorViewsController>(DEFAULT_COLLECTIONS_CONTROLLER);


interface CollectionEditorsProviderProps {
    children: React.ReactNode;
    configPermissions: ConfigPermissions;
}

export const CollectionEditorsProvider: React.FC<CollectionEditorsProviderProps> = ({
                                                                                        children,
                                                                                        configPermissions
                                                                                    }) => {

    const navigationContext = useNavigationContext();
    const navigate = useNavigate();

    const [newCollectionDialog, setNewCollectionDialog] = React.useState<{
        open: boolean,
        group?: string
    }>();
    const [editedCollectionPath, setEditedCollectionPath] = React.useState<string | undefined>();


    return (
        <CollectionEditorContext.Provider
            value={{
                editCollection: setEditedCollectionPath,
                openNewCollectionDialog: React.useCallback(({ group }) => {
                    setNewCollectionDialog({ open: true, group });
                }, []),
                newCollectionDialog,
                editedCollectionPath,
                closeNewCollectionDialog:React.useCallback(() => {
                    setNewCollectionDialog({ open: false });
                }, []),
                configPermissions
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
                    setNewCollectionDialog({ open: false });
                }}/>

        </CollectionEditorContext.Provider>
    );
};
