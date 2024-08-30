import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "@firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppBar,
    CircularProgressCenter,
    DefaultAppBarProps,
    Drawer,
    EntityCollection,
    ErrorView,
    FireCMS,
    FireCMSPlugin,
    ModeController,
    ModeControllerProvider,
    NavigationController,
    NavigationRoutes,
    PermissionsBuilder,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    User,
    useSnackbarController
} from "@firecms/core";
import { buildCollectionInference, useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
import {
    CollectionEditorPermissionsBuilder,
    CollectionsConfigController,
    mergeCollections,
    MissingReferenceWidget,
    PersistedCollection,
    useCollectionEditorPlugin
} from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import {
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
import {
    CloudErrorView,
    FireCMSCloudDrawer,
    FireCMSCloudLoginView,
    FireCMSDataEnhancementSubscriptionMessage,
    ProjectSettings,
    SubscriptionPlanWidget
} from "./components";
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
import { ExportAllowedParams, useExportPlugin } from "@firecms/data_export";
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
import { PaywallDatabaseIdField } from "./components/PaywallDatabaseIdField";

const DOCS_LIMIT = 200;

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
                                    backendApiHost = "https://api-drplyi3b6q-ey.a.run.app", // TODO
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
                includeGoogleDisclosure={false}/>
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

    return <BrowserRouter basename={basePath}
                          future={{
                              v7_relativeSplatPath: true,
                              v7_startTransition: true,
                              // v7_fetcherPersist: true,
                              // v7_normalizeFormMethod: true,
                              // v7_partialHydration: true,
                          }}>
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
        usersLimit: projectConfig.usersLimit,
        canEditRoles: projectConfig.canEditRoles,
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
                                      fireCMSBackend
                                  }: {
    configError: Error | ApiError,
    onLogout: () => void,
    fireCMSBackend: FireCMSBackend
}) {

    const errorBody = "code" in configError
        ? <CloudErrorView error={configError}
                          fireCMSBackend={fireCMSBackend}/>
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
        <div className={"flex gap-4"}>
            <ErrorIcon color={"error"}/>
            <Typography variant={"h4"}>Error logging in</Typography>
        </div>
        <div>
            {errorBody}
        </div>
        <Button variant="outlined" onClick={onLogout}>Sign out</Button>
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
    userManagement: UserManagement<FireCMSCloudUserWithRoles>;
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
            return userManagement.users.find((fireCMSUser) => fireCMSUser.email.toLowerCase() === user?.email?.toLowerCase());
        },
        [authController.authLoading, authController.user, userManagement.loading, userManagement.users]);

    const {
        delegatedLoginLoading,
        delegatedLoginError
    } = useDelegatedLogin({
        projectsApi: fireCMSBackend.projectsApi,
        firebaseApp: clientFirebaseApp,
        projectId,
        onUserChanged: (user) => {
            authController.setUser(user ?? null);
            authController.setRoles(fireCMSUser?.roles ?? []);
        },
        onAnalyticsEvent: props.onAnalyticsEvent
    });

    const permissions: PermissionsBuilder<PersistedCollection, FireCMSCloudUserWithRoles> = useCallback(({
                                                                                                             pathSegments,
                                                                                                             collection,
                                                                                                             user,
                                                                                                             entity
                                                                                                         }) => {
        return resolveUserRolePermissions<FireCMSCloudUserWithRoles>({
            collection,
            user
        });
    }, []);

    const configController = useFirestoreCollectionsConfigController({
        firebaseApp: fireCMSBackend.backendFirebaseApp,
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
                                                            onLogout={fireCMSBackend.signOut}/>
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
        loadingOrErrorComponent = <NoAccessError authController={authController} projectId={projectId}/>;
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
                           projectId
                       }: {
    authController: FirebaseAuthController,
    projectId: string
}) {
    return <CenteredView maxWidth={"md"} className={"gap-4"}>
        <ErrorView title={"You don't have access to the project " + projectId}
                   error={"You can request permission to the owner"}/>
        <Button variant="text" onClick={authController.signOut}>Sign out</Button>
    </CenteredView>;
}

function usePathSuggestions(fireCMSBackend: FireCMSBackend, projectConfig: ProjectConfig, navigationController: NavigationController) {

    const {
        collections
    } = navigationController;
    const existingPaths = (collections ?? []).map(col => col.path.trim().toLowerCase());

    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>();
    useEffect(() => {
        const googleAccessToken = fireCMSBackend.googleCredential?.accessToken;
        fireCMSBackend.projectsApi.getRootCollections(projectConfig.projectId, googleAccessToken).then((paths) => {
            setRootPathSuggestions(paths.filter(p => !existingPaths.includes(p.trim().toLowerCase())));
        })
    }, []);

    const getPathSuggestions = useCallback((path?: string) => {
        if (!path && rootPathSuggestions) {
            return Promise.resolve(rootPathSuggestions);
        }
        return Promise.resolve([]);
    }, [rootPathSuggestions]);

    return { getPathSuggestions };
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

    const snackbarController = useSnackbarController();

    const includeDataTalk = userManagement.isAdmin ?? false;
    const dataTalkPath = useDataTalkMode();
    const dataTalkMode = includeDataTalk && dataTalkPath;
    const dataTalkEndpoint = fireCMSBackend.backendApiHost + "/projects/" + projectConfig.projectId;

    const canUseDataEnhancement = projectConfig.canUseDataEnhancement;

    const adminRoutes = useMemo(() => buildAdminRoutes(userManagement.usersLimit,
        includeDataTalk,
        fireCMSBackend,
        projectConfig,
        dataTalkEndpoint,
        onAnalyticsEvent), [includeDataTalk, userManagement.usersLimit, onAnalyticsEvent]);

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
        exportAllowed: useCallback(({ collectionEntitiesCount }: ExportAllowedParams) => {
            return projectConfig.canExport || collectionEntitiesCount <= DOCS_LIMIT;
        }, [projectConfig.canExport]),
        onAnalyticsEvent,
        notAllowedView: <SubscriptionPlanWidget showForPlans={["free"]}
                                                message={`Upgrade to export more than ${DOCS_LIMIT} entities`}/>
    });
    const importPlugin = useImportPlugin({
        onAnalyticsEvent,
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: FireCMSDataEnhancementSubscriptionMessage,
        host: fireCMSBackend.backendApiHost,
        interceptUsage: canUseDataEnhancement ? undefined : () => {
            snackbarController.open({
                type: "warning",
                message: <FireCMSDataEnhancementSubscriptionMessage projectId={projectConfig.projectId}/>,
                autoHideDuration: 4000
            })
        }
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
        localTextSearchEnabled: projectConfig.canUseLocalTextSearch && projectConfig.localTextSearchEnabled
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const navigationController = useBuildNavigationController({
        basePath,
        baseCollectionPath,
        authController,
        collections: appConfig?.collections,
        views: appConfig?.views,
        userConfigPersistence,
        dataSourceDelegate: firestoreDelegate,
        injectCollections: useCallback(
            (collections: EntityCollection[]) => mergeCollections(
                collections,
                collectionConfigController.collections ?? [],
                appConfig?.modifyCollection
            ),
            [appConfig?.modifyCollection, collectionConfigController.collections])
    });

    const introMode = navigationController.initialised &&
        // navigationController.collections !== undefined &&
        (navigationController.collections ?? []).length === 0;

    const dataTalkConfig = useBuildDataTalkConfig({
        enabled: includeDataTalk,
        firebaseApp: fireCMSBackend.backendFirebaseApp,
        userSessionsPath: `projects/${projectConfig.projectId}/users/${fireCMSBackend.user?.uid}/datatalk_sessions`,
        getAuthToken: fireCMSBackend.getBackendAuthToken,
        apiEndpoint: dataTalkEndpoint
    });

    const saasPlugin = useSaasPlugin({
        projectConfig,
        firestoreDelegate,
        collectionConfigController,
        appConfig,
        dataTalkSuggestions: dataTalkConfig.rootPromptsSuggestions,
        introMode: introMode ? (projectConfig.creationType === "new" ? "new_project" : "existing_project") : undefined
    });

    const { getPathSuggestions } = usePathSuggestions(fireCMSBackend, projectConfig, navigationController);

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        collectionConfigController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        getPathSuggestions,
        getUser: (uid) => {
            return userManagement.users.find(u => u.uid === uid) ?? null;
        },
        collectionInference: buildCollectionInference(firebaseApp),
        getData: (path, parentPaths) => getFirestoreDataInPath(firebaseApp, path, parentPaths, 400),
        onAnalyticsEvent,
        components: {
            DatabaseField: projectConfig.canUseCustomDatabase ? undefined : PaywallDatabaseIdField
        }
    });

    const plugins: FireCMSPlugin<any, any, any>[] = [saasPlugin, exportPlugin, importPlugin, collectionEditorPlugin, dataEnhancementPlugin];

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <UserManagementProvider userManagement={userManagement}>
                    <ModeControllerProvider value={modeController}>
                        <FireCMS
                            navigationController={navigationController}
                            dateTimeFormat={appConfig?.dateTimeFormat}
                            entityViews={appConfig?.entityViews}
                            locale={appConfig?.locale}
                            propertyConfigs={propertyConfigsMap}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dataSourceDelegate={firestoreDelegate}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={plugins}
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

function buildAdminRoutes(usersLimit: number | undefined,
                          includeDataTalk: boolean,
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
            view: <UsersView>
                <SubscriptionPlanWidget
                    showForPlans={["free"]}
                    message={<>Upgrade to PLUS to remove the <b>{usersLimit} users limit</b></>}/>
            </UsersView>
        },
        {
            path: "roles",
            name: "Roles",
            group: "Admin",
            icon: "gpp_good",
            hideFromNavigation: true,
            view: <RolesView>
                <SubscriptionPlanWidget
                    showForPlans={["free"]}
                    message={<>Upgrade to PLUS to be able to customise <b>roles</b></>}/>
            </RolesView>
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
                    console.log("DataTalk event", event, params);
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
