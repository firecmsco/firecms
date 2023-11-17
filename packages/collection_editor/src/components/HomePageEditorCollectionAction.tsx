import {
    DeleteConfirmationDialog,
    DeleteIcon,
    IconButton,
    Menu,
    MenuItem,
    MoreVertIcon,
    PluginHomePageActionsProps,
    SettingsIcon,
    useAuthController
} from "@firecms/core";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { useCallback, useState } from "react";
import { useCollectionsConfigController } from "../useCollectionsConfigController";

export function HomePageEditorCollectionAction({
                                                   path,
                                                   collection
                                               }: PluginHomePageActionsProps) {

    const authController = useAuthController();
    const configController = useCollectionsConfigController();
    const collectionEditorController = useCollectionEditorController();

    const permissions = collectionEditorController.configPermissions({
        user: authController.user,
        collection
    });

    const onEditCollectionClicked = useCallback(() => {
        collectionEditorController?.editCollection({ path, parentPathSegments: [] });
    }, [collectionEditorController, path]);

    const [deleteRequested, setDeleteRequested] = useState(false);

    const deleteCollection = useCallback(() => {
        configController?.deleteCollection({ path });
    }, [path, configController]);

    return <>

        <div>
            {permissions.deleteCollections &&
                <Menu
                    trigger={<IconButton>
                        <MoreVertIcon size={"small"}/>
                    </IconButton>}
                >
                    <MenuItem onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDeleteRequested(true);
                    }}>
                        <DeleteIcon/>
                        Delete
                    </MenuItem>

                </Menu>

            }

            {permissions.editCollections &&
                <IconButton
                    onClick={(event) => {
                        onEditCollectionClicked();
                    }}>
                    <SettingsIcon size={"small"}/>
                </IconButton>}
        </div>

        <DeleteConfirmationDialog
            open={deleteRequested}
            onAccept={deleteCollection}
            onCancel={() => setDeleteRequested(false)}
            title={<>Delete this collection?</>}
            body={<> This will <b>not
                delete any data</b>, only
                the collection in the CMS</>}/>
    </>;

}
