import {
    ConfirmationDialog,
    PluginHomePageActionsProps,
    useAuthController,
    useSnackbarController,
    useTranslation
} from "@rebasepro/core";
import { ContentCopyIcon, DeleteIcon, IconButton, Menu, MenuItem, MoreVertIcon, SettingsIcon, } from "@rebasepro/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";
import { useState } from "react";
import { useCollectionsConfigController } from "../useCollectionsConfigController";

export function HomePageEditorCollectionAction({
    slug,
    collection
}: PluginHomePageActionsProps) {

    const snackbarController = useSnackbarController();
    const authController = useAuthController();
    const configController = useCollectionsConfigController();
    const collectionEditorController = useCollectionEditorController();
    const { t } = useTranslation();

    const permissions = collectionEditorController?.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
            collection
        })
        : {
            createCollections: false,
            editCollections: false,
            deleteCollections: false
        };

    const onEditCollectionClicked = () => {
        collectionEditorController?.editCollection({
            id: collection.slug,
            parentCollectionIds: []
        });
    };

    const onDuplicateCollectionClicked = () => {
        // Use copyFrom to duplicate the collection with all properties
        // The editor will handle clearing name, path, and id
        collectionEditorController?.createCollection({
            copyFrom: collection,
            parentCollectionIds: [],
            redirect: true,
            sourceClick: "home_page_duplicate"
        });
    };

    const [deleteRequested, setDeleteRequested] = useState(false);

    const deleteCollection = () => {
        configController?.deleteCollection({ id: collection.slug }).then(() => {
            setDeleteRequested(false);
            snackbarController.open({
                message: t("studio_home_collection_deleted"),
                type: "success"
            });
        });
    };

    return <>

        <div>
            {permissions.deleteCollections &&
                <Menu
                    trigger={<IconButton size={"small"}>
                        <MoreVertIcon size={"small"} />
                    </IconButton>}
                >
                    {permissions.createCollections &&
                        <MenuItem
                            dense={true}
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onDuplicateCollectionClicked();
                            }}>
                            <ContentCopyIcon />
                            {t("studio_home_duplicate_collection")}
                        </MenuItem>
                    }
                    <MenuItem
                        dense={true}
                        onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setDeleteRequested(true);
                        }}>
                        <DeleteIcon />
                        {t("studio_home_delete")}
                    </MenuItem>

                </Menu>

            }

            {permissions.editCollections &&
                <IconButton
                    size={"small"}
                    onClick={(event: React.MouseEvent) => {
                        onEditCollectionClicked();
                    }}>
                    <SettingsIcon size={"small"} />
                </IconButton>}
        </div>

        <ConfirmationDialog
            open={deleteRequested}
            onAccept={deleteCollection}
            onCancel={() => setDeleteRequested(false)}
            title={<>{t("studio_home_confirm_delete_title")}</>}
            body={<>{t("studio_home_confirm_delete_no_data")}</>} />
    </>;

}
