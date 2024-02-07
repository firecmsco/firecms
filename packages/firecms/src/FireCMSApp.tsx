import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    CircularProgressCenter,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
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
    User
} from "@firecms/core";

import {
    CollectionEditorPermissionsBuilder,
    CollectionsConfigController,
    MissingReferenceWidget,
    PersistedCollection,
    useCollectionEditorPlugin
} from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import {
    FireCMSBackEndProvider,
    ProjectConfig,
    ProjectConfigProvider,
    useBuildCollectionsConfigController,
    useBuildFireCMSBackend,
    useBuildProjectConfig,
    useBuildUserManagement,
    useDelegatedLogin,
    UserManagement,
} from "./hooks";

import { FireCMSAppProps } from "./FireCMSAppProps";
import { FireCMSAppConfig, FireCMSBackend, FireCMSUser } from "./types";
import {
    ADMIN_VIEWS,
    getUserRoles,
    RESERVED_GROUPS,
    resolveCollectionConfigPermissions,
    resolveUserRolePermissions
} from "./utils";
import {
    FireCMSDataEnhancementSubscriptionMessage,
    FireCMSDrawer,
    FireCMSLoginView,
    SubscriptionPlanWidget
} from "./components";
import { FireCMSProjectHomePage } from "./components/FireCMSProjectHomePage";
import {
    buildCollectionInference,
    FirebaseAuthController,
    getFirestoreDataInPath,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/firebase";
import { ExportAllowedParams, useImportExportPlugin } from "@firecms/data_import_export";
import { UserManagementProvider } from "./hooks/useUserManagement";
import { Button, CenteredView, Typography } from "@firecms/ui";
import { useSaasPlugin } from "./hooks/useSaasPlugin";

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
 * @constructor
 * @group Firebase
 */
export function FireCMSApp({
                                projectId,
                                appConfig,
                                backendApiHost = "https://api-drplyi3b6q-ey.a.run.app", // TODO
                                onAnalyticsEvent,
                                basePath,
                                baseCollectionPath,
                            }: FireCMSAppProps) {

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
        backendFirebaseApp,
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
            <FireCMSLoginView
                authController={fireCMSBackend}
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
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps<ExtraAppbarProps>>;

    basePath?: string;
    baseCollectionPath?: string;
    onAnalyticsEvent?: (event: string, data?: object) => void;
};

function FullLoadingView(props: {
    projectId: string,
    projectConfig?: ProjectConfig,
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps>,
    text?: string
}) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}
        name={props.projectConfig?.projectName ?? ""}
        logo={props.projectConfig?.logo}
        FireCMSAppBar={props.FireCMSAppBarComponent}
        includeDrawer={false}>
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
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
    });

    const userManagement = useBuildUserManagement({
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
        projectId,
        projectsApi: fireCMSBackend.projectsApi,
        usersLimit: projectConfig.usersLimit,
        canEditRoles: projectConfig.canEditRoles
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

export function FireCMSClientWithController({
                                                 projectConfig,
                                                 userManagement,
                                                 projectId,
                                                 fireCMSBackend,
                                                 appConfig,
                                                 customizationLoading,
                                                 ...props
                                             }: FireCMSClientProps & {
    userManagement: UserManagement;
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
        firebaseConfig: projectConfig.clientFirebaseConfig,
        // name: projectId
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp: clientFirebaseApp,
        onSignOut: fireCMSBackend.signOut
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
        onUserChanged: (user) => authController.setUser(user ?? null),
        onAnalyticsEvent: props.onAnalyticsEvent
    });

    const permissions: PermissionsBuilder<PersistedCollection, FireCMSUser> = useCallback(({
                                                                                               pathSegments,
                                                                                               collection,
                                                                                               user,
                                                                                               entity
                                                                                           }) =>
        resolveUserRolePermissions({
            collection,
            roles: authController.userRoles ?? undefined,
            paths: pathSegments,
            user
        }), [authController.userRoles]);

    const configController = useBuildCollectionsConfigController({
        firebaseApp: fireCMSBackend.backendFirebaseApp,
        projectId,
        permissions,
        propertyConfigs: appConfig?.propertyConfigs
    });

    useEffect(() => {
        if (userManagement.loading || authController.authLoading) return;
        const user = authController.user;
        if (!user) return;
        if (!fireCMSUser) {
            setNotValidUser(user);
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(userManagement.roles, fireCMSUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, userManagement.loading, userManagement.roles, userManagement.users, fireCMSUser, authController.authLoading]);

    let loadingOrErrorComponent;
    if (userManagement.loading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project loading"}/>;
    } else if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        loadingOrErrorComponent = <NoAccessError authController={authController}/>
    } else if (projectConfig.configError) {
        loadingOrErrorComponent = <CenteredView>
            <ErrorView
                error={projectConfig.configError as Error}/>
            <Typography>This error may be caused when trying to access with a user that is not
                registered in the project.</Typography>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>
    } else if (delegatedLoginError) {
        loadingOrErrorComponent = <CenteredView>
            <Typography variant={"h4"}>Error delegating login</Typography>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
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
        loadingOrErrorComponent = <NoAccessError authController={authController}/>;
    }

    if (loadingOrErrorComponent) {
        return <Scaffold
            key={"project_scaffold_" + projectConfig.projectId}
            name={projectConfig.projectName ?? ""}
            logo={projectConfig.logo}
            includeDrawer={false}
            FireCMSAppBar={props.FireCMSAppBarComponent}
        >
            {loadingOrErrorComponent}
        </Scaffold>;
    }

    return <FireCMSAppAuthenticated
        fireCMSUser={fireCMSUser!}
        fireCMSBackend={fireCMSBackend}
        appConfig={appConfig}
        authController={authController}
        projectConfig={projectConfig}
        collectionConfigController={configController}
        firebaseApp={clientFirebaseApp!}
        userManagement={userManagement}
        {...props}
    />;
}

function NoAccessError({ authController }: {
    authController: FirebaseAuthController
}) {
    return <CenteredView maxWidth={"md"} className={"gap-4"}>
        <ErrorView title={"You don't have access to this project"}
                   error={"You can request permission to the owner"}/>
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
                                      baseCollectionPath
                                  }: Omit<FireCMSClientProps, "projectId"> & {
    fireCMSUser: FireCMSUser;
    firebaseApp: FirebaseApp;
    projectConfig: ProjectConfig;
    userManagement: UserManagement;
    fireCMSBackend: FireCMSBackend,
    collectionConfigController: CollectionsConfigController;
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMSAppAuthenticated with an authenticated user");
    }

    const adminRoutes = useMemo(buildAdminRoutes, []);

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

    const importExportPlugin = useImportExportPlugin({
        exportAllowed: useCallback(({ collectionEntitiesCount }: ExportAllowedParams) => {
            return projectConfig.canExport || collectionEntitiesCount <= DOCS_LIMIT;
        }, [projectConfig.canExport]),
        notAllowedView: <SubscriptionPlanWidget showForPlans={["free"]}
                                                message={`Upgrade to export more than ${DOCS_LIMIT} entities`}/>
    });

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        collectionConfigController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        modifyCollection: appConfig?.modifyCollection,
        pathSuggestions: (path?) => {
            if (!path)
                return fireCMSBackend.projectsApi.getRootCollections(projectConfig.projectId);
            return Promise.resolve([]);
        },
        getUser: (uid) => {
            return userManagement.users.find(u => u.uid === uid) ?? null;
        },
        collectionInference: buildCollectionInference(firebaseApp),
        getData: (path, parentPaths) => getFirestoreDataInPath(firebaseApp, path, parentPaths, 400),
        onAnalyticsEvent
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: FireCMSDataEnhancementSubscriptionMessage,
        host: fireCMSBackend.backendApiHost,
    });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(projectConfig.projectName ?? "", projectConfig.logo);

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

    const saasPlugin = useSaasPlugin({
        projectConfig,
        firestoreDelegate,
        collectionConfigController,
        appConfig
    });

    const plugins: FireCMSPlugin<any, any, any>[] = [importExportPlugin, collectionEditorPlugin, dataEnhancementPlugin, saasPlugin];

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <UserManagementProvider userManagement={userManagement}>
                    <SnackbarProvider>
                        <ModeControllerProvider value={modeController}>
                            <FireCMS
                                collections={appConfig?.collections}
                                views={appConfig?.views}
                                basePath={basePath}
                                baseCollectionPath={baseCollectionPath}
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
                                                key={"project_scaffold_" + projectConfig.projectId}
                                                name={projectConfig.projectName ?? ""}
                                                logo={projectConfig.logo}
                                                includeDrawer={false}
                                                FireCMSAppBar={FireCMSAppBarComponent}
                                                fireCMSAppBarProps={appConfig?.fireCMSAppBarComponentProps}>
                                                <CircularProgressCenter text={"Almost there"}/>
                                            </Scaffold>;
                                    } else {
                                        component = (
                                            <Scaffold
                                                key={"project_scaffold_" + projectConfig.projectId}
                                                name={projectConfig.projectName ?? ""}
                                                logo={projectConfig.logo}
                                                Drawer={FireCMSDrawer}
                                                FireCMSAppBar={FireCMSAppBarComponent}
                                                fireCMSAppBarProps={appConfig?.fireCMSAppBarComponentProps}
                                                autoOpenDrawer={appConfig?.autoOpenDrawer}>
                                                <NavigationRoutes
                                                    HomePage={appConfig?.HomePage ?? FireCMSProjectHomePage}
                                                    customRoutes={adminRoutes}/>
                                                <SideDialogs/>
                                            </Scaffold>
                                        );
                                    }

                                    return component;
                                }}
                            </FireCMS>
                        </ModeControllerProvider>
                    </SnackbarProvider>
                </UserManagementProvider>
            </ProjectConfigProvider>
        </FireCMSBackEndProvider>
    );

}

function buildAdminRoutes() {
    return ADMIN_VIEWS.map(({
                                path,
                                name,
                                view
                            }) => <Route
        key={"navigation_admin_" + path}
        path={path}
        element={view}
    />)
}

