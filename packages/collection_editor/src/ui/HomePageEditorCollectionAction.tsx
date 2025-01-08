import {
    ConfirmationDialog,
    PluginHomePageActionsProps,
    useAuthController,
    useSnackbarController
} from "@firecms/core";
import { DeleteIcon, IconButton, Menu, MenuItem, MoreVertIcon, SettingsIcon, } from "@firecms/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { useState } from "react";
import { useCollectionsConfigController } from "../useCollectionsConfigController";

export function HomePageEditorCollectionAction({
                                                   path,
                                                   collection
                                               }: PluginHomePageActionsProps) {


    const snackbarController = useSnackbarController();
    const authController = useAuthController();
    const configController = useCollectionsConfigController();
    const collectionEditorController = useCollectionEditorController();

    const permissions = collectionEditorController.configPermissions({
        user: authController.user,
        collection
    });

    const onEditCollectionClicked = () => {
        collectionEditorController?.editCollection({
            id: collection.id,
            parentCollectionIds: []
        });
    };

    const [deleteRequested, setDeleteRequested] = useState(false);

    const deleteCollection = () => {
        configController?.deleteCollection({ id: collection.id }).then(() => {
            setDeleteRequested(false);
            snackbarController.open({
                message: "Collection deleted",
                type: "success"
            });
        });
    };

    return <>

        <div>
            {permissions.deleteCollections &&
                <Menu
                    trigger={<IconButton>
                        <MoreVertIcon size={"small"}/>
                    </IconButton>}
                >
                    <MenuItem
                        dense={true}
                        onClick={(event) => {
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

        <ConfirmationDialog
            open={deleteRequested}
            onAccept={deleteCollection}
            onCancel={() => setDeleteRequested(false)}
            title={<>Delete this collection?</>}
            body={<> This will <b>not
                delete any data</b>, only
                the collection in the CMS</>}/>
    </>;

}
