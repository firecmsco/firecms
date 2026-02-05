import React from "react";
import { Alert, CircularProgress, } from "@firecms/ui";
import { useCollectionsConfigController } from "@firecms/collection_editor";

export function CollectionsSetupLoadingLabel({
}: {
    }) {

    const configController = useCollectionsConfigController();
    const collectionsSetup = configController.collectionsSetup;
    const setupLoading = collectionsSetup?.status === "ongoing";
    const setupError = collectionsSetup?.status === "error";

    if (setupError) {
        return <Alert color={"error"}>
            <div className={"flex flex-col gap-2"}>
                <span>Error setting up collections</span>
                {collectionsSetup?.error && (
                    <span className={"text-sm opacity-75"}>{collectionsSetup.error}</span>
                )}
            </div>
        </Alert>
    }

    if (!setupLoading) {
        return null;
    }
    return <Alert color={"info"}>
        <div className={"flex flex-row items-center gap-4"}>
            <CircularProgress size={"smallest"} />
            <span>Setting up your collections...</span>
        </div>
    </Alert>
}
