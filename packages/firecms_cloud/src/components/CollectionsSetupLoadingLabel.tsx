import React, { useEffect, useState } from "react";
import { Alert, CircularProgress, CloseIcon, IconButton } from "@firecms/ui";
import { useCollectionsConfigController } from "@firecms/collection_editor";

const ERROR_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function CollectionsSetupLoadingLabel({
}: {
    }) {

    const configController = useCollectionsConfigController();
    const collectionsSetup = configController.collectionsSetup;
    const setupLoading = collectionsSetup?.status === "ongoing";
    const setupError = collectionsSetup?.status === "error";

    const [dismissed, setDismissed] = useState(false);

    // Reset dismissed state when setup status changes (e.g., a new setup is triggered)
    useEffect(() => {
        if (collectionsSetup?.status === "ongoing") {
            setDismissed(false);
        }
    }, [collectionsSetup?.status]);

    // Check if the error is older than 30 minutes, with a timer to auto-expire
    const [isExpired, setIsExpired] = useState(() => {
        if (!collectionsSetup?.updated_at || collectionsSetup.status !== "error") return false;
        const updatedAt = collectionsSetup.updated_at instanceof Date
            ? collectionsSetup.updated_at
            : collectionsSetup.updated_at.toDate();
        return Date.now() - updatedAt.getTime() > ERROR_EXPIRY_MS;
    });

    useEffect(() => {
        if (!setupError || !collectionsSetup?.updated_at) {
            setIsExpired(false);
            return;
        }
        const updatedAt = collectionsSetup.updated_at instanceof Date
            ? collectionsSetup.updated_at
            : collectionsSetup.updated_at.toDate();
        const elapsed = Date.now() - updatedAt.getTime();

        if (elapsed > ERROR_EXPIRY_MS) {
            setIsExpired(true);
            return;
        }

        const remaining = ERROR_EXPIRY_MS - elapsed;
        const timer = setTimeout(() => setIsExpired(true), remaining);
        return () => clearTimeout(timer);
    }, [setupError, collectionsSetup?.updated_at]);

    // Auto-clear expired errors from Firestore
    useEffect(() => {
        if (isExpired && configController.clearCollectionsSetup) {
            configController.clearCollectionsSetup();
        }
    }, [isExpired]);

    if (setupError && !dismissed && !isExpired) {
        return <Alert color={"error"}>
            <div className={"flex flex-row items-center justify-between gap-2 w-full"}>
                <div className={"flex flex-col gap-1"}>
                    <span>Error setting up collections</span>
                    {collectionsSetup?.error && (
                        <span className={"text-sm opacity-75"}>{collectionsSetup.error}</span>
                    )}
                </div>
                <IconButton
                    size="small"
                    onClick={() => {
                        setDismissed(true);
                        configController.clearCollectionsSetup?.();
                    }}>
                    <CloseIcon size={"small"} />
                </IconButton>
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
