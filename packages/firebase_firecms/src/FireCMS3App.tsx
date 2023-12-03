import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    BreadcrumbUpdater,
    Button,
    CenteredView,
    CircularProgressCenter,
    CMSAnalyticsEvent,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
    ModeController,
    ModeControllerProvider,
    NavigationRoutes,
    PermissionsBuilder,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    Typography,
    useBrowserTitleAndIcon,
    useBuildDataSource,
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
    useDelegatedLogin,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useInitialiseFirebase
} from "./hooks";

import { FireCMS3AppProps } from "./FireCMS3AppProps";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    FireCMSAppConfig,
    FireCMSBackend,
    FireCMSUser
} from "./types";
import {
    ADMIN_VIEWS,
    getUserRoles,
    RESERVED_GROUPS,
    resolveCollectionConfigPermissions,
    resolveUserRolePermissions
} from "./utils";
import { FireCMSDataEnhancementSubscriptionMessage, FireCMSDrawer, FireCMSLoginView } from "./components";
import { buildCollectionInference } from "./collection_editor/infer_collection";
import { FireCMSProjectHomePage } from "./components/FireCMSProjectHomePage";
import { getFirestoreDataInPath } from "./utils/database";
import { useImportExportPlugin } from "./hooks/useImportExportPlugin";
import { useFirestoreDelegate } from "./hooks/useFirestoreDelegate";

/**
 * This is the default implementation of a FireCMS app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity collections.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link FireCMS}, {@link Scaffold}, {@link SideDialogs}
 * and {@link NavigationRoutes} instead.
 *
 * @param props
 * @constructor
 * @group Firebase
 */
export function FireCMS3App({
                                projectId,
                                appConfig,
                                backendApiHost = "https://api-drplyi3b6q-ey.a.run.app", // TODO
                                onAnalyticsEvent,
                                basePath,
                                baseCollectionPath,
                            }: FireCMS3AppProps) {

    const modeController = useBuildModeController();

    const {
        firebaseApp: backendFirebaseApp,
        firebaseConfigLoading: backendConfigLoading,
        configError,
        firebaseConfigError: backendFirebaseConfigError
    } = useInitialiseFirebase({
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
        component = <CenteredView maxWidth={"lg"} fullScreen={true}>
            <FireCMSLoginView
                authController={fireCMSBackend}
                includeLogo={true}
                includeGoogleAdminScopes={false}
                includeTermsAndNewsLetter={false}
                includeGoogleDisclosure={false}/>
        </CenteredView>
    } else {
        component = <FireCMS3Client
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

export type FireCMS3ClientProps<ExtraAppbarProps = object> = {
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    fireCMSBackend: FireCMSBackend,
    projectId: string;
    appConfig?: FireCMSAppConfig;
    modeController: ModeController;
    /**
     * A component that gets rendered on the upper side of the main toolbar.
     * `toolbarExtraWidget` has no effect if this is set.
     */
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps<ExtraAppbarProps>>;

    basePath?: string;
    baseCollectionPath?: string;
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
};

function FullLoadingView(props: {
    projectId: string,
    currentProjectController?: ProjectConfig,
    text?: string
}) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}
        name={props.currentProjectController?.projectName ?? ""}
        logo={props.currentProjectController?.logo}
        includeDrawer={false}>
        <CircularProgressCenter text={props.text}/>
    </Scaffold>;
}

export const FireCMS3Client = function FireCMS3Client({
                                                          projectId,
                                                          fireCMSBackend,
                                                          ...props
                                                      }: FireCMS3ClientProps) {

    const currentProjectController = useBuildProjectConfig({
        projectId,
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
        projectsApi: fireCMSBackend.projectsApi
    });

    if (currentProjectController.loading || (!currentProjectController.clientFirebaseConfig && !currentProjectController.configError)) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Client loading"}/>;
    }

    return <FireCMS3ClientWithController
        projectId={projectId}
        currentProjectController={currentProjectController}
        fireCMSBackend={fireCMSBackend}
        customizationLoading={false}
        {...props}
    />;
};

export function FireCMS3ClientWithController({
                                                 currentProjectController,
                                                 projectId,
                                                 fireCMSBackend,
                                                 signInOptions,
                                                 appConfig,
                                                 customizationLoading,
                                                 ...props
                                             }: FireCMS3ClientProps & {
    currentProjectController: ProjectConfig;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
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
        firebaseConfig: currentProjectController.clientFirebaseConfig,
        name: projectId
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp: clientFirebaseApp,
        fireCMSBackend,
        signInOptions
    });

    const fireCMSUser = useMemo(() => {
            if (currentProjectController.loading || authController.authLoading) return;
            const user = authController.user;
            if (!user) return;
            return currentProjectController.users.find((fireCMSUser) => fireCMSUser.email === user?.email);
        },
        [authController.authLoading, authController.user, currentProjectController.loading, currentProjectController.users]);

    const {
        delegatedLoginLoading,
        delegatedLoginError
    } = useDelegatedLogin({
        projectsApi: fireCMSBackend.projectsApi,
        firebaseApp: clientFirebaseApp,
        projectId,
        onUserChanged: (user) => authController.setUser(user ?? null)
    });

    const permissions: PermissionsBuilder<PersistedCollection, FireCMSUser> = useCallback(({
                                                                                               pathSegments,
                                                                                               collection,
                                                                                               user
                                                                                           }) => resolveUserRolePermissions({
        collection,
        roles: authController.userRoles ?? undefined,
        paths: pathSegments,
        user
    }), [authController.userRoles]);

    const configController = useBuildCollectionsConfigController({
        firebaseApp: fireCMSBackend.backendFirebaseApp,
        projectId,
        permissions
    });

    useEffect(() => {
        if (currentProjectController.loading) return;
        const user = authController.user;
        if (!user) return;
        if (!fireCMSUser) {
            setNotValidUser(user);
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(currentProjectController.roles, fireCMSUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, currentProjectController.loading, currentProjectController.roles, currentProjectController.users, fireCMSUser]);

    let loadingOrErrorComponent;
    if (currentProjectController.loading) {
        return <CircularProgressCenter text={"Project loading"}/>;
    } else if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        loadingOrErrorComponent = <NoAccessError authController={authController}/>
    } else if (currentProjectController.configError) {
        loadingOrErrorComponent = <ErrorView
            error={currentProjectController.configError as Error}/>
    } else if (delegatedLoginError) {
        loadingOrErrorComponent = <CenteredView fullScreen={true}>
            <Typography variant={"h4"}>Error delegating login</Typography>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
    } else if (customizationLoading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project customization loading"}/>;
    } else if (firebaseConfigLoading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Client config loading"}/>;
    } else if (firebaseConfigError || !clientFirebaseApp) {
        loadingOrErrorComponent = <CenteredView fullScreen={true}>
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
            key={"project_scaffold_" + currentProjectController.projectId}
            name={currentProjectController.projectName ?? ""}
            logo={currentProjectController.logo}
            includeDrawer={false}
            FireCMSAppBarComponent={props.FireCMSAppBarComponent}
        >
            {loadingOrErrorComponent}
        </Scaffold>;
    }

    return <FireCMS3AppAuthenticated
        fireCMSUser={fireCMSUser!}
        fireCMSBackend={fireCMSBackend}
        appConfig={appConfig}
        authController={authController}
        currentProjectController={currentProjectController}
        collectionConfigController={configController}
        firebaseApp={clientFirebaseApp!}
        {...props}
    />;
}

function NoAccessError({ authController }: {
    authController: FirebaseAuthController
}) {
    return <CenteredView maxWidth={"md"} fullScreen={true} className={"gap-4"}>
        <ErrorView title={"You don't have access to this project"}
                   error={"You can request permission to the owner"}/>
        <Button variant="text" onClick={authController.signOut}>Sign out</Button>
    </CenteredView>;
}

function FireCMS3AppAuthenticated({
                                      fireCMSUser,
                                      firebaseApp,
                                      currentProjectController,
                                      collectionConfigController,
                                      appConfig,
                                      authController,
                                      modeController,
                                      fireCMSBackend,
                                      FireCMSAppBarComponent,
                                      onAnalyticsEvent,
                                      basePath,
                                      baseCollectionPath
                                  }: Omit<FireCMS3ClientProps, "projectId"> & {
    fireCMSUser: FireCMSUser;
    firebaseApp: FirebaseApp;
    currentProjectController: ProjectConfig;
    fireCMSBackend: FireCMSBackend,
    collectionConfigController: CollectionsConfigController;
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMS3AppAuthenticated with an authenticated user");
    }

    const adminRoutes = useMemo(buildAdminRoutes, []);

    const configPermissions: CollectionEditorPermissionsBuilder<User, PersistedCollection> = useCallback(({
                                                                                                              user,
                                                                                                              collection
                                                                                                          }) => resolveCollectionConfigPermissions({
        user: fireCMSUser,
        currentProjectController,
        collection
    }), [currentProjectController, fireCMSUser]);

    const propertyConfigsMap = useMemo(() => {
        const map: Record<string, any> = {};
        appConfig?.propertyConfigs?.forEach(field => {
            map[field.key] = field;
        });
        return map;
    }, [appConfig?.propertyConfigs]);

    const importExportPlugin = useImportExportPlugin();

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        collectionConfigController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        pathSuggestions: (path?) => {
            if (!path)
                return fireCMSBackend.projectsApi.getRootCollections(currentProjectController.projectId);
            return Promise.resolve([]);
        },
        getUser: (uid) => {
            return currentProjectController.users.find(u => u.uid === uid) ?? null;
        },
        collectionInference: buildCollectionInference(firebaseApp),
        getData: (path) => getFirestoreDataInPath(firebaseApp, path, 100)
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: FireCMSDataEnhancementSubscriptionMessage,
        host: fireCMSBackend.backendApiHost,
    });

    // const {
    //     appCheckLoading,
    // } = useInitializeAppCheck({
    //     firebaseApp,
    //     options: appConfig.appCheckOptions
    // });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(currentProjectController.projectName ?? "", currentProjectController.logo);

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchController: appConfig?.textSearchController,
        firestoreIndexesBuilder: appConfig?.firestoreIndexesBuilder
    })

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useBuildDataSource({
        delegate: firestoreDelegate,
        customFields: propertyConfigsMap
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={appConfig?.collections}
                            dateTimeFormat={appConfig?.dateTimeFormat}
                            views={appConfig?.views}
                            entityViews={appConfig?.entityViews}
                            locale={appConfig?.locale}
                            fields={propertyConfigsMap}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dataSource={dataSource}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                            basePath={basePath}
                            baseCollectionPath={baseCollectionPath}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={[importExportPlugin, collectionEditorPlugin, dataEnhancementPlugin]}
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
                                            key={"project_scaffold_" + currentProjectController.projectId}
                                            name={currentProjectController.projectName ?? ""}
                                            logo={currentProjectController.logo}
                                            includeDrawer={false}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={appConfig?.fireCMSAppBarComponentProps}>
                                            <CircularProgressCenter/>
                                        </Scaffold>;
                                } else {
                                    component = (
                                        <Scaffold
                                            key={"project_scaffold_" + currentProjectController.projectId}
                                            name={currentProjectController.projectName ?? ""}
                                            logo={currentProjectController.logo}
                                            Drawer={FireCMSDrawer}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={appConfig?.fireCMSAppBarComponentProps}
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
        element={
            <BreadcrumbUpdater
                path={path}
                key={`navigation_admin_${path}`}
                title={name}>
                {view}
            </BreadcrumbUpdater>}
    />)
}

