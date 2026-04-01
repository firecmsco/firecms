import React from "react";
import { AIIcon, ConfirmationDialog, useSnackbarController } from "@firecms/core";
import { LoadingButton, Typography } from "@firecms/ui";
import { ProjectsApi } from "../api/projects";
import { useCollectionsConfigController } from "@firecms/collection_editor";
import { useTranslation } from "@firecms/core";

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
    const collectionsSetupStatus = configController.collectionsSetup?.status;
    const setupLoading = collectionsSetupStatus === "ongoing";

    const [setUpRequested, setSetupRequested] = React.useState(false);
    const snackbarController = useSnackbarController();
    const [loadingAutomaticallyCreate, setLoadingAutomaticallyCreate] = React.useState(false);
    const { t } = useTranslation();

    const doCollectionSetup = () => {
        onClick?.();
        setLoadingAutomaticallyCreate(true);
        snackbarController.open({
            message: t("this_can_take_a_minute"),
            type: "info"
        });
        projectsApi.initialCollectionsSetup(projectId)
            .then((collections) => {
                console.log("Collections set up", collections);
                if (!collections || collections.length === 0) {
                    onNoCollections?.();
                    snackbarController.open({
                        message: t("no_collections_found_to_setup"),
                        type: "info"
                    });
                } else {
                    onSuccess?.();
                    snackbarController.open({
                        message: <>{t("collections_have_been_setup")}<br />{collections.map(c => c.name).join(", ")}</>,
                        type: "success"
                    });
                }
            })
            .catch((error) => {
                onError?.();
                console.error("Error setting up collections", error);
                snackbarController.open({
                    message: t("error_setting_up_collections"),
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
            {t("auto_setup_collections_button")}
        </LoadingButton>

        <ConfirmationDialog
            open={setUpRequested}
            onAccept={() => {
                setSetupRequested(false);
                doCollectionSetup();
            }}
            onCancel={() => setSetupRequested(false)}
            title={<>{t("auto_setup_collections_title")}</>}
            body={<Typography variant="body2">{t("auto_setup_collections_desc").split("NOT").map((part: string, i: number, arr: string[]) => (
                <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <b>NOT</b>}
                </React.Fragment>
            ))}</Typography>} />
    </>;
}
