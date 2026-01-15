import React from "react";
import { Alert, CircularProgress, } from "@firecms/ui";
import { useCollectionsConfigController } from "@firecms/collection_editor";

export function CollectionsSetupLoadingLabel({
                                             }: {
}) {

    const configController = useCollectionsConfigController();
    const setupLoading = configController.collectionsSetup?.status === "ongoing";

    if (!setupLoading) {
        return null;
    }
    return <Alert color={"info"}>
        <div className={"flex flex-row items-center gap-4"}>
            <CircularProgress size={"smallest"}/>
            <span>Setting up your collections...</span>
        </div>
    </Alert>
}
