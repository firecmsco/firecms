import React from "react";
import { AIIcon, ConfirmationDialog, useSnackbarController } from "@firecms/core";
import { LoadingButton } from "@firecms/ui";
import { ProjectsApi } from "../api/projects";
import { useCollectionsConfigController } from "@firecms/collection_editor";

export function AutoSetUpCollectionsButton({
    projectsApi,
    projectId,
    askConfirmation,
    small,
    onClick,
    onSuccess,
    onNoCollections,
    onError,
    color = "neutral",
    disabled
}: {
    projectsApi: ProjectsApi;
    projectId: string;
    onClick?: () => void;
    onSuccess?: () => void;
    onNoCollections?: () => void;
    onError?: () => void;
    askConfirmation?: boolean;
    small?: boolean;
    color?: "primary" | "secondary" | "text" | "error" | "neutral";
    disabled?: boolean;
}) {

    const configController = useCollectionsConfigController();
    const setupLoading = configController.collectionsSetup?.status === "ongoing";

    const [setUpRequested, setSetupRequested] = React.useState(false);
    const snackbarController = useSnackbarController();
    const [loadingAutomaticallyCreate, setLoadingAutomaticallyCreate] = React.useState(false);

    const doCollectionSetup = () => {
        onClick?.();
        setLoadingAutomaticallyCreate(true);
        snackbarController.open({
            message: "This can take a minute or two",
            type: "info"
        });
        projectsApi.initialCollectionsSetup(projectId)
            .then((collections) => {
                console.log("Collections set up", collections);
                if (!collections || collections.length === 0) {
                    onNoCollections?.();
                    snackbarController.open({
                        message: "No collections found to set up",
                        type: "info"
                    });
                } else {
                    onSuccess?.();
                    snackbarController.open({
                        message: <>Your collections have been set up!<br />{collections.map(c => c.name).join(", ")}</>,
                        type: "success"
                    });
                }
            })
            .catch((error) => {
                onError?.();
                console.error("Error setting up collections", error);
                snackbarController.open({
                    message: "Error setting up collections",
                    type: "error"
                });
            })
            .finally(() => setLoadingAutomaticallyCreate(false));
    };

    return <>
        <LoadingButton
            disabled={disabled}
            loading={loadingAutomaticallyCreate || setupLoading}
            color={color}
            className={small ? "px-2 py-0.5 rounded-lg" : undefined}
            size={small ? "small" : undefined}
            onClick={() => {
                if (askConfirmation) {
                    setSetupRequested(true);
                } else {
                    doCollectionSetup()
                }
            }}>
            <AIIcon size={"smallest"} />
            Automatically set up collections
        </LoadingButton>

        <ConfirmationDialog
            open={setUpRequested}
            onAccept={() => {
                setSetupRequested(false);
                doCollectionSetup();
            }}
            onCancel={() => setSetupRequested(false)}
            title={<>Automatically set up collections?</>}
            body={<>This will automatically create collection configs for collections that are <b>NOT</b> already
                mapped</>} />
    </>;
}
