import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "@firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppBar,
    CircularProgressCenter,
    DefaultAppBarProps,
    Drawer,
    ErrorView,
    FireCMS,
    FireCMSPlugin,
    ModeController,
    ModeControllerProvider,
    NavigationRoutes,
    PermissionsBuilder,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    User
} from "@firecms/core";
import { buildCollectionInference, useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import {
    CollectionEditorPermissionsBuilder,
    CollectionsConfigController,
    MissingReferenceWidget,
    PersistedCollection,
    useCollectionEditorPlugin
} from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import {
    CloudUserManagement,
    FireCMSBackEndProvider,
    ProjectConfig,
    ProjectConfigProvider,
    useBuildCloudUserManagement,
    useBuildFireCMSBackend,
    useBuildProjectConfig,
    useDelegatedLogin
} from "./hooks";

import { FireCMSCloudAppProps } from "./FireCMSCloudAppProps";
import { ApiError, FireCMSAppConfig, FireCMSBackend, FireCMSCloudUser, FireCMSCloudUserWithRoles } from "./types";
import { RESERVED_GROUPS, resolveCollectionConfigPermissions } from "./utils";
import { CloudErrorView, FireCMSCloudDrawer, FireCMSCloudLoginView, ProjectSettings } from "./components";
import { FireCMSCloudHomePage } from "./components/FireCMSCloudHomePage";
import {
    FirebaseAuthController,
    getFirestoreDataInPath,
    useAppCheck,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";
import { useExportPlugin } from "@firecms/data_export";
import { useImportPlugin } from "@firecms/data_import";
import { Button, CenteredView, ErrorIcon, Typography } from "@firecms/ui";
import { useSaasPlugin } from "./hooks/useSaasPlugin";
import {
    resolveUserRolePermissions,
    RolesView,
    UserManagement,
    UserManagementProvider,
    UsersView
} from "@firecms/user_management";
import { DataTalkProvider, DataTalkRoutes, useBuildDataTalkConfig } from "@firecms/datatalk";
import { useDataTalkMode } from "./hooks/useDataTalkMode";
import { FireCMSCloudDataTalkDrawer } from "./components/FireCMSCloudDataTalkDrawer";
import { useEntityHistoryPlugin } from "@firecms/entity_history";
import { useRootCollectionSuggestions } from "./hooks/useRootCollectionSuggestions";

/**
 * This is the default implementation of a FireCMS app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity collections.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * @param props

 * @group Firebase
 */
export function FireCMSCloudApp({
                                    projectId,
                                    appConfig,
                                    backendApiHost = "https://api.firecms.co", // TODO
                                    onAnalyticsEvent,
                                    basePath,
                                    baseCollectionPath
                                }: FireCMSCloudAppProps) {

    const modeController = useBuildModeController();

    const {
        firebaseApp: backendFirebaseApp,
        firebaseConfigLoading: backendConfigLoading,
        configError,
        firebaseConfigError: backendFirebaseConfigError
    } = useInitialiseFirebase({
        name: "firecms-backend",
        fromUrl: backendApiHost + "/config"
    });

    const fireCMSBackend = useBuildFireCMSBackend({
        backendApiHost,
        backendFirebaseApp
    });

    let component;

    if (backendConfigLoading || !backendFirebaseApp) {
        component = <FullLoadingView projectId={projectId} text={"Backend loading"}/>;
    } else if (backendFirebaseConfigError) {
        component = <ErrorView
            error={backendFirebaseConfigError}/>
    } else if (configError) {
        component = <ErrorView
            error={configError}/>
    } else if (fireCMSBackend.authLoading) {
        component = <FullLoadingView projectId={projectId} text={"Auth loading"}/>;
    } else if (!fireCMSBackend.user) {
        component = <CenteredView maxWidth={"lg"}>
            <FireCMSCloudLoginView
                fireCMSBackend={fireCMSBackend}
                includeLogo={true}
                includeGoogleAdminScopes={false}
                includeTermsAndNewsLetter={false}
                includeGoogleDisclosure={false}
                onAnalyticsEvent={onAnalyticsEvent}
            />
        </CenteredView>
    } else {
        component = <FireCMSClient
            fireCMSBackend={fireCMSBackend}
            projectId={projectId}
            modeController={modeController}
            appConfig={appConfig}
            basePath={basePath}
            baseCollectionPath={baseCollectionPath}
            onAnalyticsEvent={onAnalyticsEvent}
        />
    }

    return <BrowserRouter basename={basePath}>
        {component}
    </BrowserRouter>;

}

export type FireCMSClientProps<ExtraAppbarProps = object> = {
    fireCMSBackend: FireCMSBackend,
    projectId: string;
    appConfig?: FireCMSAppConfig;
    modeController: ModeController;
    /**
     * A component that gets rendered on the upper side of the main toolbar.
     */
    FireCMSAppBarComponent?: React.ComponentType<DefaultAppBarProps<ExtraAppbarProps>>;

    basePath?: string;
    baseCollectionPath?: string;
    onAnalyticsEvent?: (event: string, data?: object) => void;
};

function FullLoadingView(props: {
    projectId: string,
    projectConfig?: ProjectConfig,
    FireCMSAppBarComponent?: React.ComponentType<DefaultAppBarProps>,
    text?: string
}) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}>

        <AppBar logo={props.projectConfig?.logo}>
            {props.FireCMSAppBarComponent &&
                <props.FireCMSAppBarComponent title={props.projectConfig?.projectName ?? ""}/>}
        </AppBar>
        <CircularProgressCenter text={props.text}/>
    </Scaffold>;
}

export const FireCMSClient = function FireCMSClient({
                                                        projectId,
                                                        fireCMSBackend,
                                                        ...props
                                                    }: FireCMSClientProps) {

    const projectConfig = useBuildProjectConfig({
        projectId,
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp
    });

    const userManagement = useBuildCloudUserManagement({
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
        projectId,
        projectsApi: fireCMSBackend.projectsApi,
        fireCMSBackend
    });

    if (userManagement.loading || (!projectConfig.clientFirebaseConfig && !projectConfig.configError)) {
        return <FullLoadingView projectId={projectId}
                                projectConfig={projectConfig}
                                FireCMSAppBarComponent={props.FireCMSAppBarComponent}
                                text={"Client loading"}/>;
    }

    return <FireCMSClientWithController
        projectId={projectId}
        projectConfig={projectConfig}
        fireCMSBackend={fireCMSBackend}
        customizationLoading={false}
        userManagement={userManagement}
        {...props}
    />;
};

function ErrorDelegatingLoginView({
                                      configError,
                                      onLogout,
                                      fireCMSBackend,
                                      onFixed
                                  }: {
    configError: Error | ApiError,
    onLogout: () => void,
    fireCMSBackend: FireCMSBackend,
    onFixed?: () => void
}) {

    const errorBody = "code" in configError
        ? <CloudErrorView error={configError}
                          fireCMSBackend={fireCMSBackend}
                          onFixed={onFixed}/>
        : <>
            <Typography>{configError.message}</Typography>
            <Typography>
                This error may be caused when a user has been deleted from the client project.
                Make sure a user exists in the client project with the same email as the one trying to log in.
                If the problem persists, reach us at <a href="mailto:hello@firecms.co?subject=FireCMS%20login%20error"
                                                        rel="noopener noreferrer"
                                                        target="_blank"> hello@firecms.co </a>, or in our <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>.
            </Typography>
        </>;

    return <CenteredView maxWidth={"2xl"} className={"flex flex-col gap-4"}>
        <div className={"flex gap-4 items-center"}>
            <ErrorIcon color={"error"}/>
            <Typography variant={"h4"}>Error logging in</Typography>
        </div>
        <div>
            {errorBody}
        </div>
        <div>
            If you are experiencing issues logging in, feel free to reach us at <a href="mailto:hello@firecms.co"
                                                                                   rel="noopener noreferrer"
                                                                                   target="_blank">
            hello@firecms.co</a>
        </div>
        <Button variant="outlined" size="small" onClick={onLogout}>Sign out</Button>
    </CenteredView>;
}

function NoAccessErrorView(props: { projectId: string, configError: Error, onLogout: () => void }) {
    return <CenteredView maxWidth={"2xl"} className={"flex flex-col gap-4"}>
        <div className={"flex gap-4 items-center"}>
            <ErrorIcon color={"error"}/>
            <Typography variant={"h4"}>Error accessing project</Typography>
        </div>
        <Typography>{props.configError.message}</Typography>
        <Typography>
            This error may be caused when trying to access with a user that is not
            registered in the project <code>{props.projectId}</code>.
            You can ask the project owner to add you to the project.
        </Typography>
        <Button variant="outlined" onClick={props.onLogout}>Sign out</Button>
    </CenteredView>;
}

export function FireCMSClientWithController({
                                                projectConfig,
                                                userManagement,
                                                projectId,
                                                fireCMSBackend,
                                                appConfig,
                                                customizationLoading,
                                                ...props
                                            }: FireCMSClientProps & {
    logo?: string;
    userManagement: CloudUserManagement;
    projectConfig: ProjectConfig;
    projectId: string;
    customizationLoading: boolean;
}) {

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    const {
        firebaseApp: clientFirebaseApp,
        firebaseConfigLoading,
        configError: firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit: appConfig?.onFirebaseInit,
        firebaseConfig: projectConfig.clientFirebaseConfig
    });

    const appCheckResult = useAppCheck({
        firebaseApp: clientFirebaseApp,
        options: appConfig?.appCheck ?? projectConfig.appCheck
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp: clientFirebaseApp,
        onSignOut: fireCMSBackend.signOut,
        defineRolesFor: userManagement.defineRolesFor
    });

    const fireCMSUser = useMemo(() => {
            if (userManagement.loading || authController.authLoading) return;
            const user = authController.user;
            if (!user) return;
            return userManagement.users.find((fireCMSUser) => fireCMSUser.email?.toLowerCase() === user?.email?.toLowerCase());
        },
        [authController.authLoading, authController.user, userManagement.loading, userManagement.users]);

    const {
        delegatedLoginLoading,
        delegatedLoginError,
        checkLogin
    } = useDelegatedLogin({
        projectsApi: fireCMSBackend.projectsApi,
        firebaseApp: clientFirebaseApp,
        projectId,
        onUserChanged: (user) => {
            authController.setUser(user ?? null);
            authController.setUserRoles(fireCMSUser?.roles ?? []);
        },
        onAnalyticsEvent: props.onAnalyticsEvent
    });

    const permissions: PermissionsBuilder<PersistedCollection, FireCMSCloudUserWithRoles> = useCallback(({
                                                                                                             collection,
                                                                                                             user,
                                                                                                         }) => {
        return resolveUserRolePermissions<FireCMSCloudUserWithRoles>({
            collection,
            user
        });
    }, []);

    const configController = useFirestoreCollectionsConfigController({
        firebaseApp: fireCMSBackend.backendFirebaseApp,
        generalConfigPath: `projects/${projectId}`,
        configPath: `projects/${projectId}/collections`,
        permissions,
        propertyConfigs: appConfig?.propertyConfigs
    });

    let loadingOrErrorComponent;
    if (userManagement.loading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project loading"}/>;
    } else if (appCheckResult.loading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"AppCheck loading"}/>;
    }
        // else if (appCheckResult.error) {
        //     loadingOrErrorComponent = <ErrorView error={appCheckResult.error}/>;
    // }
    else if (delegatedLoginError) {
        console.error("Delegated login error", delegatedLoginError)
        loadingOrErrorComponent = <ErrorDelegatingLoginView configError={delegatedLoginError}
                                                            fireCMSBackend={fireCMSBackend}
                                                            onLogout={fireCMSBackend.signOut}
                                                            onFixed={() => checkLogin()}/>
    } else if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        loadingOrErrorComponent = <NoAccessError authController={authController}
                                                 projectId={projectId}/>
    } else if (projectConfig.configError) {
        loadingOrErrorComponent = <NoAccessErrorView configError={projectConfig.configError}
                                                     projectId={projectId}
                                                     onLogout={fireCMSBackend.signOut}/>
    } else if (customizationLoading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project customization loading"}/>;
    } else if (firebaseConfigLoading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Client config loading"}/>;
    } else if (firebaseConfigError) {
        loadingOrErrorComponent = <CenteredView>
            <ErrorView error={firebaseConfigError ?? "Error fetching client Firebase config"}/>
        </CenteredView>;
    } else if (delegatedLoginLoading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Logging in to " + projectId}/>;
    } else if (!authController.user) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Auth loading"}/>;
    } else if (!fireCMSUser) {
        loadingOrErrorComponent = <NoAccessError authController={authController}
                                                 userManagement={userManagement}
                                                 projectId={projectId}/>;
    } else if (projectConfig.blocked) {
        loadingOrErrorComponent = <CenteredView>
            <Typography variant={"h4"}>Project blocked</Typography>
            <Typography variant={"body1"}>This project has been blocked by the FireCMS team.</Typography>
            <Typography variant={"body1"}>Please contact <a href={"mailto:hello@firecms.co"}>hello@firecms.co</a> for
                more information</Typography>
        </CenteredView>
    }

    if (loadingOrErrorComponent) {
        return <Scaffold
            key={"project_scaffold_" + projectConfig.projectId}>
            <AppBar
                logo={projectConfig?.logo ?? props.logo}>
                {props.FireCMSAppBarComponent &&
                    <props.FireCMSAppBarComponent title={projectConfig.projectName ?? ""}
                                                  {...appConfig?.fireCMSAppBarComponentProps}/>}
            </AppBar>
            {loadingOrErrorComponent}
        </Scaffold>;
    }

    return <SnackbarProvider>
        <FireCMSAppAuthenticated
            fireCMSUser={fireCMSUser!}
            fireCMSBackend={fireCMSBackend}
            appConfig={appConfig}
            authController={authController}
            projectConfig={projectConfig}
            collectionConfigController={configController}
            firebaseApp={clientFirebaseApp!}
            userManagement={userManagement}
            {...props}
        />
    </SnackbarProvider>;
}

function NoAccessError({
                           authController,
                           userManagement,
                           projectId
                       }: {
    authController: FirebaseAuthController,
    userManagement?: CloudUserManagement,
    projectId: string
}) {
    let error = "You can request permission to the owner.";
    if (authController.user?.email && (userManagement?.users ?? []).map(user => user.email).includes(authController.user?.email)) {
        error += " The user is registered in the project, but it is out of the free plan.";
    }
    return <CenteredView maxWidth={"lg"} className={"gap-4"}>
        <ErrorView title={"You don't have access to the project " + projectId}
                   error={error}/>
        <Button variant="text" onClick={authController.signOut}>Sign out</Button>
    </CenteredView>;
}

function FireCMSAppAuthenticated({
                                     fireCMSUser,
                                     firebaseApp,
                                     projectConfig,
                                     userManagement,
                                     collectionConfigController,
                                     appConfig,
                                     authController,
                                     modeController,
                                     fireCMSBackend,
                                     FireCMSAppBarComponent,
                                     onAnalyticsEvent,
                                     basePath,
                                     baseCollectionPath,
                                     logo
                                 }: Omit<FireCMSClientProps, "projectId"> & {
    fireCMSUser: FireCMSCloudUser;
    firebaseApp: FirebaseApp;
    projectConfig: ProjectConfig;
    userManagement: UserManagement<FireCMSCloudUserWithRoles>;
    fireCMSBackend: FireCMSBackend,
    collectionConfigController: CollectionsConfigController;
    authController: FirebaseAuthController;
    logo?: string;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMSAppAuthenticated with an authenticated user");
    }

    const includeDataTalk = userManagement.isAdmin ?? false;
    const dataTalkPath = useDataTalkMode();
    const dataTalkMode = includeDataTalk && dataTalkPath;
    const dataTalkEndpoint = fireCMSBackend.backendApiHost + "/projects/" + projectConfig.projectId;

    const adminRoutes = useMemo(() => buildAdminRoutes(
        includeDataTalk,
        fireCMSBackend,
        projectConfig,
        dataTalkEndpoint,
        onAnalyticsEvent), [includeDataTalk, onAnalyticsEvent]);

    const configPermissions: CollectionEditorPermissionsBuilder<User, PersistedCollection> = useCallback(({
                                                                                                              user,
                                                                                                              collection
                                                                                                          }) => resolveCollectionConfigPermissions({
        user: fireCMSUser,
        userManagement,
        collection
    }), [userManagement, fireCMSUser]);

    const propertyConfigsMap = useMemo(() => {
        const map: Record<string, any> = {};
        appConfig?.propertyConfigs?.forEach(field => {
            map[field.key] = field;
        });
        return map;
    }, [appConfig?.propertyConfigs]);

    const exportPlugin = useExportPlugin({
        exportAllowed: () => true,
        onAnalyticsEvent
    });

    const importPlugin = useImportPlugin({
        onAnalyticsEvent
    });

    const historyDefaultEnabled = projectConfig.historyDefaultEnabled;
    const historyPlugin = useEntityHistoryPlugin({
        defaultEnabled: historyDefaultEnabled,
        getUser: (uid) => userManagement.users.find((user) => user.uid === uid) ?? null,
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        host: fireCMSBackend.backendApiHost,
    });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(projectConfig.projectName ?? "", projectConfig.logo ?? logo);

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: appConfig?.textSearchControllerBuilder,
        firestoreIndexesBuilder: appConfig?.firestoreIndexesBuilder,
        localTextSearchEnabled: projectConfig.localTextSearchEnabled
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const dataTalkConfig = useBuildDataTalkConfig({
        enabled: includeDataTalk,
        firebaseApp: fireCMSBackend.backendFirebaseApp,
        userSessionsPath: `projects/${projectConfig.projectId}/users/${fireCMSBackend.user?.uid}/datatalk_sessions`,
        getAuthToken: fireCMSBackend.getBackendAuthToken,
        apiEndpoint: dataTalkEndpoint,
        loadSamplePrompts: (collectionConfigController.collections ?? []).length > 0
    });

    const { rootPathSuggestions } = useRootCollectionSuggestions({
        projectId: projectConfig.projectId
    });

    useEffect(() => {
        if (collectionConfigController.collectionsSetup?.status !== "ongoing") {
            navigationController?.refreshNavigation();
        }
    }, [collectionConfigController.collectionsSetup?.status]);

    const saasPlugin = useSaasPlugin({
        projectConfig,
        collectionConfigController,
        appConfig,
        fireCMSBackend,
        userManagement,
        onAnalyticsEvent,
        dataTalkSuggestions: dataTalkConfig.rootPromptsSuggestions,
        introMode: projectConfig.creationType === "new" ? "new_project" : "existing_project",
        historyDefaultEnabled,
        rootPathSuggestions
    });

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        collectionConfigController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        getUser: userManagement.getUser,
        collectionInference: buildCollectionInference(firebaseApp),
        getData: (path, parentPaths) => getFirestoreDataInPath(firebaseApp, path, parentPaths, 400),
        onAnalyticsEvent,
        includeIntroView: false,
        pathSuggestions: rootPathSuggestions
    });

    const plugins: FireCMSPlugin<any, any, any>[] = [
        saasPlugin,
        exportPlugin,
        importPlugin,
        collectionEditorPlugin,
        dataEnhancementPlugin,
        historyPlugin
    ];

    const navigationController = useBuildNavigationController({
        basePath,
        baseCollectionPath,
        authController,
        collections: projectConfig.isTrialOver ? [] : appConfig?.collections,
        views: projectConfig.isTrialOver ? [] : appConfig?.views,
        userConfigPersistence,
        dataSourceDelegate: firestoreDelegate,
        plugins
    });

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <UserManagementProvider userManagement={userManagement}>
                    <ModeControllerProvider value={modeController}>
                        <FireCMS
                            navigationController={navigationController}
                            dateTimeFormat={appConfig?.dateTimeFormat}
                            entityViews={appConfig?.entityViews}
                            entityActions={appConfig?.entityActions}
                            locale={appConfig?.locale}
                            propertyConfigs={propertyConfigsMap}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dataSourceDelegate={firestoreDelegate}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                            onAnalyticsEvent={onAnalyticsEvent}
                            components={{
                                missingReference: MissingReferenceWidget
                            }}
                        >
                            {({
                                  context,
                                  loading
                              }) => {

                                let component;
                                if (loading) {
                                    component =
                                        <Scaffold
                                            key={"project_scaffold_" + projectConfig.projectId}>
                                            <AppBar
                                                logo={projectConfig.logo ?? logo}>
                                                {FireCMSAppBarComponent &&
                                                    <FireCMSAppBarComponent title={projectConfig.projectName ?? ""}
                                                                            {...appConfig?.fireCMSAppBarComponentProps}/>}
                                            </AppBar>
                                            <CircularProgressCenter text={"Almost there"}/>
                                        </Scaffold>;
                                } else {
                                    component = (
                                        <Scaffold
                                            logo={projectConfig.logo ?? logo}
                                            key={"project_scaffold_" + projectConfig.projectId}
                                            autoOpenDrawer={appConfig?.autoOpenDrawer}>
                                            <AppBar>
                                                {FireCMSAppBarComponent &&
                                                    <FireCMSAppBarComponent title={projectConfig.projectName ?? ""}
                                                                            {...appConfig?.fireCMSAppBarComponentProps}/>}
                                            </AppBar>
                                            <Drawer>
                                                {dataTalkMode
                                                    ? <FireCMSCloudDataTalkDrawer/>
                                                    : <FireCMSCloudDrawer/>}
                                            </Drawer>
                                            <NavigationRoutes
                                                homePage={appConfig?.HomePage
                                                    ? <appConfig.HomePage/>
                                                    : <FireCMSCloudHomePage/>}
                                            >
                                                {adminRoutes}
                                            </NavigationRoutes>
                                            <SideDialogs/>
                                        </Scaffold>
                                    );
                                }

                                if (includeDataTalk) {
                                    component = <DataTalkProvider
                                        key={"datatalk_provider_" + projectConfig.projectId}
                                        config={dataTalkConfig}>
                                        {component}
                                    </DataTalkProvider>
                                }

                                return component;
                            }}
                        </FireCMS>
                    </ModeControllerProvider>
                </UserManagementProvider>
            </ProjectConfigProvider>
        </FireCMSBackEndProvider>
    );

}

function buildAdminRoutes(includeDataTalk: boolean,
                          fireCMSBackend: FireCMSBackend,
                          projectConfig: ProjectConfig,
                          dataTalkEndpoint: string,
                          onAnalyticsEvent?: (event: string, data?: object) => void) {

    const views = [
        {
            path: "users",
            name: "CMS Users",
            group: "Admin",
            icon: "face",
            hideFromNavigation: true,
            view: <UsersView/>
        },
        {
            path: "roles",
            name: "Roles",
            group: "Admin",
            icon: "gpp_good",
            hideFromNavigation: true,
            view: <RolesView/>
        },
        {
            path: "settings",
            name: "Project settings",
            group: "Admin",
            icon: "settings",
            hideFromNavigation: true,
            view: <ProjectSettings/>
        }
    ];

    if (includeDataTalk) {
        views.push({
            path: "datatalk/*",
            name: "DataTalk",
            group: "Admin",
            icon: "settings",
            hideFromNavigation: true,
            view: <DataTalkRoutes
                onAnalyticsEvent={(event, params) => {
                    onAnalyticsEvent?.("datatalk:" + event, params);
                }}
                apiEndpoint={dataTalkEndpoint}
                getAuthToken={fireCMSBackend.getBackendAuthToken}/>
        });

    }
    return views.map(({
                          path,
                          name,
                          view
                      }) => <Route
        key={"navigation_admin_" + path}
        path={path}
        element={view}
    />)
}
