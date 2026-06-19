import React from "react";
import { prettifyIdentifier, useAuthController, useNavigationController, useSnackbarController, useTranslation } from "@firecms/core";
import { AddIcon, Button, Chip, CircularProgress, Collapse, StorageIcon, Typography, } from "@firecms/ui";
import { useCollectionEditorController, useCollectionsConfigController } from "@firecms/collection_editor";
import { AutoSetUpCollectionsButton } from "./AutoSetUpCollectionsButton";
import { useFireCMSBackend, useProjectConfig } from "../hooks";
import { RootCollectionInfo } from "../api/projects";
import { useNavigate } from "react-router";

export function RootCollectionSuggestions({
    introMode,
    onAnalyticsEvent,
    rootPathSuggestions
}: {
    introMode?: "new_project" | "existing_project",
    onAnalyticsEvent?: (event: string, data?: object) => void;
    rootPathSuggestions?: RootCollectionInfo[]; // undefined means loading
}) {

    const navigationController = useNavigationController();
    const authController = useAuthController();
    const fireCMSBackend = useFireCMSBackend();
    const projectConfig = useProjectConfig();
    const snackbarController = useSnackbarController();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const collectionEditorController = useCollectionEditorController();
    const configController = useCollectionsConfigController();
    const collectionsSetupStatus = configController.collectionsSetup?.status;
    const setupLoading = collectionsSetupStatus === "ongoing";
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const existingPaths = (navigationController.collections ?? []).map(c => c.path);
    const filteredSuggestions = (rootPathSuggestions ?? []).filter((info) => !existingPaths.includes(info.path));

    // Track which paths are currently being set up
    const [settingUpPaths, setSettingUpPaths] = React.useState<Set<string>>(new Set());

    const setupSingleCollection = async (info: RootCollectionInfo) => {
        setSettingUpPaths(prev => new Set(prev).add(info.path));
        onAnalyticsEvent?.("suggestion_chip_setup_click", { path: info.path });

        snackbarController.open({
            message: t("setting_up_collection", { name: prettifyIdentifier(info.path) }),
            type: "info"
        });

        try {
            const collections = await fireCMSBackend.projectsApi.setupCollections(
                projectConfig.projectId,
                [{ path: info.path, databaseId: info.databaseId }]
            );
            if (collections && collections.length > 0) {
                const collectionPath = navigationController.buildUrlCollectionPath(info.path);
                snackbarController.open({
                    message: <div className={"flex flex-row items-center gap-4"}>
                        <span>{t("collection_setup_success", { name: prettifyIdentifier(info.path) })}</span>
                        <Button
                            variant={"text"}
                            size={"small"}
                            onClick={() => {
                                navigate(collectionPath);
                                snackbarController.close();
                            }}>
                            {t("go_to_collection")}
                        </Button>
                    </div>,
                    type: "success"
                });
                navigationController.refreshNavigation();
                onAnalyticsEvent?.("suggestion_chip_setup_success", { path: info.path });
            } else {
                snackbarController.open({
                    message: t("no_collections_found_to_setup"),
                    type: "info"
                });
            }
        } catch (error) {
            console.error("Error setting up collection", info.path, error);
            snackbarController.open({
                message: t("error_setting_up_collections"),
                type: "error"
            });
            onAnalyticsEvent?.("suggestion_chip_setup_error", { path: info.path });
        } finally {
            setSettingUpPaths(prev => {
                const next = new Set(prev);
                next.delete(info.path);
                return next;
            });
        }
    };

    const loading = filteredSuggestions === undefined;
    const showSuggestions = (filteredSuggestions ?? []).length > 0;
    const forceShowSuggestions = introMode === "existing_project";
    return <Collapse
        in={forceShowSuggestions || showSuggestions}>

        <div
            className={"flex flex-col gap-2 p-2 my-4"}>

            <Typography variant={"body2"} color={"secondary"} className={"flex items-center gap-2"}>
                <StorageIcon size="smallest" /> {t("add_your")} <b>{t("database_collections")}</b> {t("to_firecms")}
            </Typography>

            <div
                className={"flex flex-row gap-1 overflow-scroll no-scrollbar justify-start items-center"}>

                <AutoSetUpCollectionsButton projectsApi={fireCMSBackend.projectsApi}
                    projectId={projectConfig.projectId}
                    askConfirmation={true}
                    small={true}
                    suggestions={filteredSuggestions}
                    disabled={!canCreateCollections}
                    onClick={() => onAnalyticsEvent?.("suggestions_cols_setup_click")}
                    onSuccess={() => onAnalyticsEvent?.("suggestions_cols_setup_success")}
                    onNoCollections={() => onAnalyticsEvent?.("suggestions_cols_setup_no_cols")}
                    onError={() => onAnalyticsEvent?.("suggestions_cols_setup_error")}
                />

                {loading && <CircularProgress size={"smallest"} />}

                {!loading && (filteredSuggestions ?? []).map((info) => {
                    const isSettingUp = settingUpPaths.has(info.path);
                    return (
                        <div key={info.path} className={"flex-shrink-0"}>
                            <Chip
                                icon={isSettingUp
                                    ? <CircularProgress size={"smallest"} className={"!w-3 !h-3 !border-[2px]"} />
                                    : <AddIcon size={"small"} />}
                                colorScheme={"cyanLighter"}
                                onClick={canCreateCollections && !isSettingUp && !setupLoading
                                    ? () => setupSingleCollection(info)
                                    : undefined}
                                size="small">
                                {info.path}
                            </Chip>
                        </div>
                    );
                })}
                {!loading && filteredSuggestions?.length === 0 &&
                    <Typography variant={"caption"} className={"ml-2"}>{t("no_unmapped_collections")}</Typography>
                }
            </div>
        </div>
    </Collapse>
}
