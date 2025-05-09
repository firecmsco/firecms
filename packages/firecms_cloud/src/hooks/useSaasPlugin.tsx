import React from "react";
import { FireCMSPlugin, useNavigationController, useSnackbarController } from "@firecms/core";
import { CollectionsConfigController } from "@firecms/collection_editor";
import { LoadingButton, Typography } from "@firecms/ui";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";
import { FireCMSAppConfig, FireCMSBackend } from "../types";
import { RootCollectionSuggestions } from "../components/RootCollectionSuggestions";
import { DataTalkSuggestions } from "../components/DataTalkSuggestions";

export function useSaasPlugin({
                                  projectConfig,
                                  collectionConfigController,
                                  appConfig,
                                  dataTalkSuggestions,
                                  introMode,
                                  fireCMSBackend,
                                  onAnalyticsEvent
                              }: {
    projectConfig: ProjectConfig;
    appConfig?: FireCMSAppConfig;
    collectionConfigController: CollectionsConfigController;
    dataTalkSuggestions?: string[];
    introMode?: "new_project" | "existing_project";
    fireCMSBackend: FireCMSBackend;
    onAnalyticsEvent?: (event: string, data?: object) => void;
}): FireCMSPlugin {

    const hasOwnTextSearchImplementation = Boolean(appConfig?.textSearchControllerBuilder);

    const additionalChildrenStart = <>
        {introMode ? <IntroWidget
            fireCMSBackend={fireCMSBackend}
            onAnalyticsEvent={onAnalyticsEvent}
            introMode={introMode}
            projectConfig={projectConfig}/> : undefined}
    </>;

    const additionalChildrenEnd = <>
        {!introMode && <DataTalkSuggestions suggestions={dataTalkSuggestions}/>}
        <RootCollectionSuggestions introMode={introMode}/>
    </>;

    return {
        key: "saas",
        homePage: {
            additionalChildrenStart,
            additionalChildrenEnd,
        },
        collectionView: {

            blockSearch: ({
                              context,
                              path,
                              collection,
                              parentCollectionIds
                          }) => {
                return !(projectConfig.localTextSearchEnabled && collection.textSearchEnabled);
            },

            showTextSearchBar: ({
                                    context,
                                    path,
                                    collection
                                }) => {
                if (collection.textSearchEnabled === false) {
                    return false;
                }
                return true;
            },
            onTextSearchClick: ({
                                    context,
                                    path,
                                    collection,
                                    parentCollectionIds
                                }) => {

                const canSearch = projectConfig.localTextSearchEnabled && collection.textSearchEnabled;
                if (!canSearch) {
                    if (parentCollectionIds === undefined) {
                        console.warn("Enabling text search: Parent collection ids are undefined")
                    } else {
                        context.dialogsController.open({
                            key: "text_search_info",
                            Component: (props) => <TextSearchInfoDialog {...props}
                                                                        hasOwnTextSearchImplementation={hasOwnTextSearchImplementation}
                                                                        collectionConfigController={collectionConfigController}
                                                                        parentCollectionIds={parentCollectionIds}
                                                                        path={path}
                                                                        collection={collection}/>
                        });
                    }
                }
                return Promise.resolve(false);
            }
        }
    }
}

export function IntroWidget({
                                introMode,
                                fireCMSBackend,
                                projectConfig,
                                onAnalyticsEvent
                            }: {
    introMode?: "new_project" | "existing_project";
    fireCMSBackend: FireCMSBackend;
    projectConfig: ProjectConfig;
    onAnalyticsEvent?: (event: string, data?: object) => void;
}) {

    const snackbarController = useSnackbarController();
    const [loadingAutomaticallyCreate, setLoadingAutomaticallyCreate] = React.useState(false);
    const {
        projectsApi
    } = fireCMSBackend;

    const navigation = useNavigationController();
    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    return (
        <div className={"mt-8 flex flex-col p-2"}>
            <Typography variant={"h4"} className="mb-4">Welcome</Typography>
            <Typography paragraph={true}>Your admin panel is ready ✌️</Typography>
            <Typography paragraph={true}>
                FireCMS can be used as a standalone admin panel but it shines when you add your own custom
                functionality. Including your own custom components, fields, actions, views, and more.
            </Typography>
            <div>
                <Typography className={"inline"}>Start customizing with:</Typography>
                <div
                    className={"ml-2 select-all font-mono bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-white p-2 px-3  border-surface-200 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                    yarn create firecms-app
                </div>
                <Typography className={"inline ml-2"}>More info in the <a
                    href={"https://firecms.co/docs/cloud/quickstart"}
                    rel="noopener noreferrer"
                    target="_blank">docs</a></Typography>
            </div>

            <Typography paragraph={true} className={"mt-8"}>
                FireCMS Cloud is able to automatically set up collections for you, using the data you have in your
                database and AI. This might take a few minutes, but it will save you a lot of time.
            </Typography>

            <LoadingButton
                loading={loadingAutomaticallyCreate}
                onClick={() => {
                    onAnalyticsEvent?.("initial_cols_setup_click");
                    setLoadingAutomaticallyCreate(true);
                    snackbarController.open({
                        message: "This can take a minute or two",
                        type: "info"
                    });
                    projectsApi.initialCollectionsSetup(projectConfig.projectId)
                        .then((collections) => {
                            if (!collections || collections.length === 0) {

                                onAnalyticsEvent?.("initial_cols_setup_no_cols");
                                snackbarController.open({
                                    message: "No collections found to set up",
                                    type: "info"
                                });
                            } else {
                                onAnalyticsEvent?.("initial_cols_setup_success");
                                snackbarController.open({
                                    message: "Your collections have been set up!",
                                    type: "success"
                                });
                            }
                        })
                        .catch((error) => {
                            onAnalyticsEvent?.("initial_cols_setup_error");
                            console.error("Error setting up collections", error);
                            snackbarController.open({
                                message: "Error setting up collections",
                                type: "error"
                            });
                        })
                        .finally(() => setLoadingAutomaticallyCreate(false));
                }}>
                Automatically set up collections
            </LoadingButton>
        </div>
    );
}
