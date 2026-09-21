import React from "react";
import { AIIcon, ConfirmationDialog, useSnackbarController, useTranslation } from "@firecms/core";
import { LoadingButton, Typography } from "@firecms/ui";
import { InitialCollectionsSetupDiagnostics, ProjectsApi, RootCollectionInfo } from "../api/projects";
import { CollectionSetupSelectionDialog } from "./CollectionSetupSelectionDialog";
import { useCollectionSetupErrors } from "./useCollectionSetupErrors";
import { useCollectionsSetupOngoing } from "./useCollectionsSetupOngoing";

export function AutoSetUpCollectionsButton({
    projectsApi,
    projectId,
    askConfirmation,
    small,
    suggestions,
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
    /** Receives why the list came back empty - notably `listingFailed`. */
    onNoCollections?: (diagnostics?: InitialCollectionsSetupDiagnostics) => void;
    onError?: (error: Error) => void;
    askConfirmation?: boolean;
    small?: boolean;
    suggestions?: RootCollectionInfo[];
    color?: "primary" | "secondary" | "text" | "error" | "neutral";
    disabled?: boolean;
}) {

    const setupLoading = useCollectionsSetupOngoing();

    const [setUpRequested, setSetupRequested] = React.useState(false);
    const snackbarController = useSnackbarController();
    const [loadingAutomaticallyCreate, setLoadingAutomaticallyCreate] = React.useState(false);
    const { t } = useTranslation();
    const { reportSetupError, setupErrorDialog } = useCollectionSetupErrors(projectId);

    // Use the selection dialog when suggestions are provided (CTA in RootCollectionSuggestions)
    const useSelectionDialog = askConfirmation && suggestions && suggestions.length > 0;

    const doCollectionSetup = () => {
        onClick?.();
        setLoadingAutomaticallyCreate(true);
        snackbarController.open({
            message: t("setting_up_collections"),
            type: "info"
        });
        let diagnostics: InitialCollectionsSetupDiagnostics | undefined;
        projectsApi.initialCollectionsSetup(projectId, (d) => { diagnostics = d; })
            .then((collections) => {
                console.log("Collections set up", collections);
                if (!collections || collections.length === 0) {
                    onNoCollections?.(diagnostics);
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
                onError?.(error instanceof Error ? error : new Error(String(error)));
                console.error("Error setting up collections", error);
                reportSetupError(error, doCollectionSetup);
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
                if (useSelectionDialog) {
                    onClick?.();
                    setSetupRequested(true);
                } else if (askConfirmation) {
                    setSetupRequested(true);
                } else {
                    doCollectionSetup()
                }
            }}>
            <AIIcon size={"smallest"} />
            {t("auto_setup_collections_button")}
        </LoadingButton>

        {useSelectionDialog
            ? <CollectionSetupSelectionDialog
                open={setUpRequested}
                onClose={() => setSetupRequested(false)}
                suggestions={suggestions}
                projectsApi={projectsApi}
                projectId={projectId}
                onSuccess={() => {
                    onSuccess?.();
                    setSetupRequested(false);
                }}
                onError={(error, retry) => {
                    onError?.(error);
                    reportSetupError(error, retry);
                }}
            />
            : <ConfirmationDialog
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
        }

        {setupErrorDialog}
    </>;
}
