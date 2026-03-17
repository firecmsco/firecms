import {
    Alert,
    CloseIcon,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    LoadingButton,
    SearchIcon,
    Typography
} from "@firecms/ui";
import { useProjectConfig } from "../../hooks";
import { EntityCollection, useSnackbarController, useTranslation } from "@firecms/core";
import { useState } from "react";
import { CollectionsConfigController } from "@firecms/collection_editor";

export function TextSearchInfoDialog({
                                         open,
                                         closeDialog,
                                         collection,
                                         collectionConfigController,
                                         parentCollectionIds,
                                         hasOwnTextSearchImplementation
                                     }: {
    open: boolean,
    closeDialog: () => void,
    path: string,
    collection: EntityCollection,
    collectionConfigController: CollectionsConfigController,
    parentCollectionIds?: string[],
    hasOwnTextSearchImplementation: boolean
}) {

    const { t } = useTranslation();
    const snackbarController = useSnackbarController();
    const projectConfig = useProjectConfig();
    const [enablingLocalSearch, setEnablingLocalSearch] = useState<boolean>(false);
    const [enablingForCollection, setEnablingForCollection] = useState<boolean>(false);

    function enableTextSearchForCollection() {
        return collectionConfigController.updateCollection({
            id: collection.id,
            parentCollectionIds,
            collectionData: {
                id: collection.id,
                textSearchEnabled: true
            }
        })
    }

    return <Dialog
        maxWidth={"2xl"}
        open={open}
        onOpenChange={(open: boolean) => !open ? closeDialog() : undefined}
    >

        <DialogTitle variant={"h5"} className={"flex flex-row gap-4 items-center"}>
            <SearchIcon/>
            {t("text_search_dialog_title")}
        </DialogTitle>
        <DialogContent className={"flex flex-col gap-4"}>

            {!hasOwnTextSearchImplementation && <>

                <div className={"flex flex-col gap-2 mb-2"}>
                    <Alert color={"warning"}>
                        {t("text_search_local_not_recommended")}
                    </Alert>

                    <Typography variant={"caption"} className={"mt-4"}>
                        {t("text_search_local_fetch_warning")}
                    </Typography>

                    <Typography variant={"caption"}>
                        {t("text_search_external_suggestion")}
                    </Typography>
                </div>

                <Typography>
                    {t("text_search_local_description")}
                </Typography>

            </>}

            {hasOwnTextSearchImplementation && <>
                <Typography>
                    {t("text_search_own_implementation")}
                </Typography>
            </>}

            <div className={"flex items-end justify-end gap-4"}>
                {(hasOwnTextSearchImplementation || projectConfig.localTextSearchEnabled) && !collection.textSearchEnabled &&
                    <LoadingButton loading={enablingForCollection}
                                   size={"large"}
                                   onClick={() => {
                                       setEnablingForCollection(true);
                                       enableTextSearchForCollection()
                                           .then(() => {
                                               snackbarController.open({
                                                   message: t("text_search_enabled_snackbar"),
                                                   type: "success"
                                               });
                                               closeDialog();
                                           })
                                           .finally(() => setEnablingForCollection(false));
                                   }}>
                        {t("text_search_enable_for_collection")}
                    </LoadingButton>}

                {!hasOwnTextSearchImplementation && !projectConfig.localTextSearchEnabled &&
                    <LoadingButton loading={enablingLocalSearch}
                                   size={"large"}
                                   onClick={() => {
                                       setEnablingLocalSearch(true);
                                       projectConfig.updateLocalTextSearchEnabled(true)
                                           .then(async () => {
                                               if (!collection.textSearchEnabled)
                                                   await enableTextSearchForCollection();
                                               snackbarController.open({
                                                   message: t("text_search_enabled_snackbar"),
                                                   type: "success"
                                               });
                                               closeDialog();
                                           })
                                           .finally(() => setEnablingLocalSearch(false));
                                   }}>
                        {t("text_search_enable_for_project")}
                    </LoadingButton>}

            </div>

        </DialogContent>

        <IconButton className={"absolute top-4 right-4"}
                    onClick={closeDialog}>
            <CloseIcon/>
        </IconButton>
    </Dialog>;
}

