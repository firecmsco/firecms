import React, { useCallback } from "react";
import { AIIcon, EntityCollection, FireCMSPlugin, InternalUserManagement, useAuthController, useNavigationController } from "@firecms/core";
import { CollectionsConfigController, mergeCollections, useCollectionEditorController } from "@firecms/collection_editor";
import { AddIcon, ArticleIcon, Button, Card, cls, HistoryIcon, Typography } from "@firecms/ui";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";
import { FireCMSAppConfig, FireCMSBackend } from "../types";
import { RootCollectionSuggestions } from "../components/RootCollectionSuggestions";
import { PermissionErrorView } from "../components/PermissionErrorView";
import { DataTalkSuggestions } from "../components/DataTalkSuggestions";
import { AutoSetUpCollectionsButton } from "../components/AutoSetUpCollectionsButton";
import { EnableEntityHistoryView } from "../components/EnableEntityHistoryView";
import { CollectionsSetupLoadingLabel } from "../components/CollectionsSetupLoadingLabel";
import { RootCollectionInfo } from "../api/projects";

export function useSaasPlugin({
    projectConfig,
    collectionConfigController,
    appConfig,
    dataTalkSuggestions,
    userManagement,
    introMode,
    fireCMSBackend,
    onAnalyticsEvent,
    historyDefaultEnabled,
    rootPathSuggestions
}: {
    projectConfig: ProjectConfig;
    appConfig?: FireCMSAppConfig;
    userManagement: InternalUserManagement;
    collectionConfigController: CollectionsConfigController;
    dataTalkSuggestions?: string[];
    introMode?: "new_project" | "existing_project";
    fireCMSBackend: FireCMSBackend;
    onAnalyticsEvent?: (event: string, data?: object) => void;
    historyDefaultEnabled?: boolean;
    rootPathSuggestions?: RootCollectionInfo[];
}): FireCMSPlugin {

    const hasOwnTextSearchImplementation = Boolean(appConfig?.textSearchControllerBuilder);

    const additionalChildrenStart = <>
        <CollectionsSetupLoadingLabel />
        <IntroWidget
            fireCMSBackend={fireCMSBackend}
            onAnalyticsEvent={onAnalyticsEvent}
            introMode={introMode}
            projectConfig={projectConfig} />
    </>;

    const additionalChildrenEnd = <>
        <DataTalkSuggestions
            suggestions={dataTalkSuggestions}
            onAnalyticsEvent={onAnalyticsEvent} />
        <RootCollectionSuggestions introMode={introMode}
            onAnalyticsEvent={onAnalyticsEvent}
            rootPathSuggestions={rootPathSuggestions}
        />
    </>;

    const modifyCollection = useCallback((collection: EntityCollection) => {
        if (collection.history === false && !historyDefaultEnabled) {
            return {
                ...collection,
                entityViews: [
                    ...(collection.entityViews ?? []),
                    {
                        key: "__history",
                        name: "History",
                        tabComponent: <HistoryIcon size={"small"} />,
                        Builder: EnableEntityHistoryView,
                        position: "start"
                    }
                ],
            } satisfies EntityCollection;
        }
        return collection;
    }, []);

    const injectCollections = useCallback(
        (collections: EntityCollection[]) => mergeCollections(
            collections,
            (collectionConfigController.collections ?? []).map(modifyCollection),
            appConfig?.modifyCollection
        ),
        [collectionConfigController.collections]);

    return {
        key: "saas",
        homePage: {
            additionalChildrenStart,
            additionalChildrenEnd,
        },
        userManagement,
        collection: {
            injectCollections: projectConfig.isTrialOver ? undefined : injectCollections,
            modifyCollection
        },
        collectionView: {

            CollectionError: useCallback(({ path, collection, parentCollectionIds, error }: {
                path: string;
                collection: EntityCollection;
                parentCollectionIds?: string[];
                error: Error;
            }) => {
                return <PermissionErrorView
                    path={path}
                    collection={collection}
                    parentCollectionIds={parentCollectionIds}
                    error={error}
                    projectId={projectConfig.projectId}
                    projectsApi={fireCMSBackend.projectsApi}
                    onAnalyticsEvent={onAnalyticsEvent}
                />;
            }, [projectConfig.projectId, fireCMSBackend.projectsApi, onAnalyticsEvent]),

            blockSearch: ({
                context,
                path,
                collection,
                parentCollectionIds
            }) => {
                return !(projectConfig.typesenseSearchConfig?.enabled || (projectConfig.localTextSearchEnabled && collection.textSearchEnabled));
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

                const canSearch = projectConfig.typesenseSearchConfig?.enabled || (projectConfig.localTextSearchEnabled && collection.textSearchEnabled);
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
                                collection={collection} />
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

    const navigation = useNavigationController();
    const collectionEditorController = useCollectionEditorController();
    const authController = useAuthController();

    if (!navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    if (!navigation.initialised) {
        return null;
    }
    const hasCollections = navigation.initialised &&
        (navigation.collections ?? []).length > 0;

    if (hasCollections) {
        return null;
    }

    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user
        }).createCollections
        : true;

    const subtitle = introMode === "existing_project"
        ? "Your admin panel is ready. Let's bring in your data."
        : "Your admin panel is ready. Here's how to get started.";

    return (
        <div className={"mt-8 flex flex-col gap-6 p-2"}>
            <div>
                <Typography variant={"h4"} className="mb-2">
                    Welcome to FireCMS Cloud
                </Typography>
                <Typography color={"secondary"}>
                    {subtitle}
                </Typography>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>

                {introMode === "existing_project" && (
                    <IntroCard
                        icon={<AIIcon size={"small"} className={"text-primary"}/>}
                        title={"Auto-detect collections"}
                        description={"Let AI scan your database and automatically generate collection schemas."}
                    >
                        <AutoSetUpCollectionsButton
                            projectId={projectConfig.projectId}
                            projectsApi={fireCMSBackend.projectsApi}
                            color={"primary"}
                            onClick={() => onAnalyticsEvent?.("intro_cols_setup_click")}
                            onSuccess={() => onAnalyticsEvent?.("intro_cols_setup_success")}
                            onNoCollections={() => onAnalyticsEvent?.("intro_cols_setup_no_cols")}
                            onError={() => onAnalyticsEvent?.("intro_cols_setup_error")}
                        />
                    </IntroCard>
                )}

                <IntroCard
                    icon={<AddIcon size={"small"} className={"text-secondary"}/>}
                    title={"Create a collection"}
                    description={"Manually define your first collection from scratch using the visual editor."}
                >
                    <Button
                        variant={"outlined"}
                        size={"small"}
                        disabled={!canCreateCollections}
                        onClick={() => {
                            onAnalyticsEvent?.("intro_create_collection_click");
                            collectionEditorController.createCollection({
                                parentCollectionIds: [],
                                redirect: true,
                                sourceClick: "intro_widget"
                            });
                        }}
                    >
                        Create collection
                    </Button>
                </IntroCard>

                <IntroCard
                    icon={<ArticleIcon size={"small"} className={"text-secondary"}/>}
                    title={"Read the docs"}
                    description={"Learn how to customize fields, views, actions and more."}
                >
                    <Button
                        variant={"text"}
                        size={"small"}
                        component={"a"}
                        href={"https://firecms.co/docs/cloud/quickstart"}
                        rel={"noopener noreferrer"}
                        target={"_blank"}
                        onClick={() => onAnalyticsEvent?.("intro_docs_click")}
                    >
                        Explore docs
                    </Button>
                </IntroCard>

            </div>

            <Typography variant={"caption"} color={"disabled"}>
                Want to customize with code? Run{" "}
                <code
                    className={"select-all font-mono bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-xs"}>
                    npx create-firecms-app
                </code>{" "}
                to scaffold a local project.
            </Typography>
        </div>
    );
}

function IntroCard({
    icon,
    title,
    description,
    children
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <Card
            className={cls(
                "p-4 flex flex-col gap-3",
                "transition-all duration-200 ease-in-out",
                "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
            )}
        >
            <div className={"flex items-center gap-2"}>
                {icon}
                <Typography variant={"subtitle2"}>{title}</Typography>
            </div>
            <Typography variant={"body2"} color={"secondary"} className={"flex-grow"}>
                {description}
            </Typography>
            <div>
                {children}
            </div>
        </Card>
    );
}

// save locally that the alert was dismissed
function saveHistoryAlertDismissed() {
    localStorage.setItem("firecms_saas_alert_history_dismissed", "true");
}

function isHistoryAlertDismissed(): boolean {
    return localStorage.getItem("firecms_saas_alert_history_dismissed") === "true";
}
