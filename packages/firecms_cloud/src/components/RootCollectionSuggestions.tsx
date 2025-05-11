import React, { useEffect } from "react";
import { unslugify, useAuthController, useNavigationController } from "@firecms/core";
import { AddIcon, Chip, CircularProgress, Collapse, StorageIcon, Typography, } from "@firecms/ui";
import { useCollectionEditorController } from "@firecms/collection_editor";
import { AutoSetUpCollectionsButton } from "./AutoSetUpCollectionsButton";
import { useFireCMSBackend, useProjectConfig } from "../hooks";

export function RootCollectionSuggestions({
                                              introMode,
                                              onAnalyticsEvent
                                          }: {
    introMode?: "new_project" | "existing_project",
    onAnalyticsEvent?: (event: string, data?: object) => void;
}) {

    const authController = useAuthController();
    const navigationController = useNavigationController();

    const fireCMSBackend = useFireCMSBackend();
    const projectConfig = useProjectConfig();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const existingPaths = (navigationController.collections ?? []).map(c => c.path);
    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>();
    const filteredRootPathSuggestions = (rootPathSuggestions ?? []).filter((path) => !existingPaths.includes(path));

    useEffect(() => {
        const googleAccessToken = fireCMSBackend.googleCredential?.accessToken;
        fireCMSBackend.projectsApi.getRootCollections(projectConfig.projectId, googleAccessToken).then((paths) => {
            setRootPathSuggestions(paths.filter(p => !existingPaths.includes(p.trim().toLowerCase())));
        });
    }, []);

    if (!rootPathSuggestions || !navigationController.initialised) {
        return null;
    }

    const showSuggestions = filteredRootPathSuggestions.length > 0;
    const forceShowSuggestions = introMode === "existing_project";
    return <Collapse
        in={forceShowSuggestions || showSuggestions}>

        <div
            className={"flex flex-col gap-2 p-2 my-4"}>

            <Typography variant={"body2"} color={"secondary"} className={"flex items-center gap-2"}>
                <StorageIcon size="smallest"/> Add your <b>database collections</b> to FireCMS
            </Typography>

            <div
                className={"flex flex-row gap-1 overflow-scroll no-scrollbar "}>

                <AutoSetUpCollectionsButton projectsApi={fireCMSBackend.projectsApi}
                                            projectId={projectConfig.projectId}
                                            askConfirmation={true}
                                            small={true}
                                            disabled={!canCreateCollections}
                                            onClick={() => onAnalyticsEvent?.("suggestions_cols_setup_click")}
                                            onSuccess={() => onAnalyticsEvent?.("suggestions_cols_setup_success")}
                                            onNoCollections={() => onAnalyticsEvent?.("suggestions_cols_setup_no_cols")}
                                            onError={() => onAnalyticsEvent?.("suggestions_cols_setup_error")}
                />

                {rootPathSuggestions === undefined && <CircularProgress size={"smallest"}/>}

                {(filteredRootPathSuggestions ?? []).map((path) => {
                    return (
                        <div key={path} className={"flex-shrink-0"}>
                            <Chip
                                icon={<AddIcon size={"small"}/>}
                                colorScheme={"cyanLighter"}
                                onClick={collectionEditorController && canCreateCollections
                                    ? () => collectionEditorController.createCollection({
                                        initialValues: {
                                            path,
                                            name: unslugify(path)
                                        },
                                        parentCollectionIds: [],
                                        redirect: true,
                                        sourceClick: "root_collection_suggestion"
                                    })
                                    : undefined}
                                size="small">
                                {path}
                            </Chip>
                        </div>
                    );
                })}
                {filteredRootPathSuggestions?.length === 0 &&
                    <Typography variant={"caption"}>No suggestions</Typography>}
            </div>
        </div>
    </Collapse>
}
