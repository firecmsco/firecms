import {
    Alert,
    CloseIcon,
    Dialog,
    DialogContent,
    IconButton,
    LoadingButton,
    SearchIcon,
    Typography
} from "@firecms/ui";
import { useProjectConfig } from "../../hooks";
import { SubscriptionPlanWidget } from "./SubscriptionPlanWidget";
import { UpgradeToPlusButton } from "./UpgradeToPlusButton";
import { EntityCollection, useSnackbarController } from "@firecms/core";
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

    const snackbarController = useSnackbarController();
    const projectConfig = useProjectConfig();
    const [enablingLocalSearch, setEnablingLocalSearch] = useState<boolean>(false);
    const [enablingForCollection, setEnablingForCollection] = useState<boolean>(false);

    function enableTextSearchForCollection() {
        return collectionConfigController.updateCollection({
            id: collection.id,
            parentCollectionIds,
            collectionData: {
                textSearchEnabled: true
            }
        })
    }

    return <Dialog
        maxWidth={"2xl"}
        open={open}
        onOpenChange={(open: boolean) => !open ? closeDialog() : undefined}
    >
        <DialogContent className={"flex flex-col gap-4"}>

            <Typography variant={"h5"} className={"flex flex-row gap-4 items-center"}>
                <SearchIcon/>
                Enable text search
            </Typography>

            <SubscriptionPlanWidget
                includeCTA={false}
                showForPlans={["free"]}
                message={<>Upgrade to PLUS to use text search</>}/>

            {!hasOwnTextSearchImplementation && <>

                <div className={"flex flex-col gap-2 my-2"}>
                    <Alert color={"warning"}>
                        Local text search is not recommended for large collections.
                    </Alert>

                    <Typography variant={"caption"}>
                        Note that enabling local text search will need to fetch all documents
                        from your collection and store them in the browser. This can be inefficient
                        for large collections. It can also incur in additional costs.
                    </Typography>

                    <Typography variant={"caption"}>
                        For larger collections, you are encouraged to use an external
                        search engine such as Algolia or Elastic Search, and assign a
                        search delegate to your config.
                    </Typography>
                </div>

                <Typography>
                    Local text search is the simplest way to enable text search in your
                    collection. It loads all documents in the collection in the browser
                    and performs the search locally. This is the recommended option for
                    small collections.
                </Typography>

            </>}

            {hasOwnTextSearchImplementation && <>
                <Typography>
                    You have implemented your own text search controller. You enable text search
                    for your collection.
                </Typography>
            </>}

            <div className={"flex items-end justify-end gap-4"}>
                {(hasOwnTextSearchImplementation || projectConfig.localTextSearchEnabled) && !collection.textSearchEnabled &&
                    <LoadingButton variant={"outlined"}
                                   loading={enablingForCollection}
                                   size={"lg"}
                                   onClick={() => {
                                       setEnablingForCollection(true);
                                       enableTextSearchForCollection()
                                           .then(() => {
                                               snackbarController.open({
                                                   message: "Local text search enabled",
                                                   type: "success"
                                               });
                                               closeDialog();
                                           })
                                           .finally(() => setEnablingForCollection(false));
                                   }}
                                   disabled={!projectConfig.canUseLocalTextSearch}>
                        Enable for this collection
                    </LoadingButton>}

                {!hasOwnTextSearchImplementation && !projectConfig.localTextSearchEnabled &&
                    <LoadingButton variant={"outlined"}
                                   loading={enablingLocalSearch}
                                   size={"lg"}
                                   onClick={() => {
                                       setEnablingLocalSearch(true);
                                       projectConfig.updateLocalTextSearchEnabled(true)
                                           .then(async () => {
                                               if (!collection.textSearchEnabled)
                                                   await enableTextSearchForCollection();
                                               snackbarController.open({
                                                   message: "Local text search enabled",
                                                   type: "success"
                                               });
                                               closeDialog();
                                           })
                                           .finally(() => setEnablingLocalSearch(false));
                                   }}
                                   disabled={!projectConfig.canUseLocalTextSearch}>
                        Enable for project
                    </LoadingButton>}

                {!projectConfig.canUseLocalTextSearch && <UpgradeToPlusButton/>}

            </div>

        </DialogContent>

        <IconButton className={"absolute top-4 right-4"}
                    onClick={closeDialog}>
            <CloseIcon/>
        </IconButton>
    </Dialog>;
}
