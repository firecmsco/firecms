import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppCheckOptions,
    BreadcrumbUpdater,
    CenteredView,
    CircularProgressCenter,
    CMSAnalyticsEvent,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
    Locale,
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
} from "firecms";

import {
    CollectionEditorPermissionsBuilder,
    CollectionsConfigController,
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
    useFirestoreDataSource,
    useInitialiseFirebase,
    useInitializeAppCheck
} from "./hooks";

import { FireCMS3AppProps } from "./FireCMS3AppProps";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    FireCMSBackend,
    FireCMSCustomization,
    SaasUser
} from "./types";
import { FirestoreTextSearchController } from "./types/text_search";
import {
    ADMIN_VIEWS,
    getUserRoles,
    RESERVED_GROUPS,
    resolveCollectionConfigPermissions,
    resolveSaasPermissions
} from "./utils";
import { SaasDataEnhancementSubscriptionMessage, SaasDrawer, SaasLoginView } from "./components";
import { buildCollectionInference } from "./collection_editor/infer_collection";
import { SaasProjectPage } from "./components/SaasProjectPage";

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
 * @category Firebase
 */
export function FireCMS3App({
                                projectId,
                                config,
                                textSearchController,
                                onFirebaseInit,
                                appCheckOptions,
                                dateTimeFormat,
                                locale,
                                basePath,
                                baseCollectionPath,
                                onAnalyticsEvent,
                                plugins,
                                backendApiHost = "https://api-kdoe6pj3qq-ey.a.run.app" // TODO
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

    if (backendConfigLoading || !backendFirebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (backendFirebaseConfigError) {
        return <ErrorView
            error={backendFirebaseConfigError}/>
    }

    if (configError) {
        return <ErrorView
            error={configError}/>
    }

    if (fireCMSBackend.authLoading) {
        return <CircularProgressCenter/>;
    }

    if (!fireCMSBackend.user) {
        return <SaasLoginView
            authController={fireCMSBackend}
            includeLogo={true}
            includeGoogleAdminScopes={false}
            includeTermsAndNewsLetter={false}
            includeGoogleDisclosure={false}/>
    }

    return <BrowserRouter basename={basePath}>
        <FireCMS3Client
            fireCMSBackend={fireCMSBackend}
            projectId={projectId}
            onFirebaseInit={onFirebaseInit}
            appCheckOptions={appCheckOptions}
            textSearchController={textSearchController}
            config={config}
            dateTimeFormat={dateTimeFormat}
            locale={locale}
            basePath={basePath}
            baseCollectionPath={baseCollectionPath}
            onAnalyticsEvent={onAnalyticsEvent}
            modeController={modeController}
        />
    </BrowserRouter>;

}

export type FireCMS3ClientProps = {
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    fireCMSBackend: FireCMSBackend,
    projectId: string;
    config?: FireCMSCustomization;
    onFirebaseInit?: (config: object, app: FirebaseApp) => void;
    appCheckOptions?: AppCheckOptions;
    textSearchController?: FirestoreTextSearchController;
    dateTimeFormat?: string;
    locale?: Locale;
    basePath?: string;
    baseCollectionPath?: string;
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
    modeController: ModeController;
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps>
};

export const FireCMS3Client = function FireCMS3Client({
                                                          projectId,
                                                          fireCMSBackend,
                                                          ...props
                                                      }: FireCMS3ClientProps) {

    const currentProjectController = useBuildProjectConfig({
        projectId,
        getBackendAuthToken: fireCMSBackend.getBackendAuthToken,
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
        projectsApi: fireCMSBackend.projectsApi
    });

    if (!currentProjectController.clientFirebaseConfig) {
        return <CircularProgressCenter/>;
    }

    return <FireCMS3ClientInner
        projectId={projectId}
        currentProjectController={currentProjectController}
        fireCMSBackend={fireCMSBackend}
        {...props}
    />;
};

function FireCMS3ClientInner({
                                 currentProjectController,
                                 projectId,
                                 onFirebaseInit,
                                 fireCMSBackend,
                                 signInOptions,
                                 ...props
                             }: FireCMS3ClientProps & {
    currentProjectController: ProjectConfig;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    projectId: string;
}) {

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    const {
        firebaseApp: clientFirebaseApp,
        firebaseConfigLoading,
        configError: firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig: currentProjectController.clientFirebaseConfig,
        name: projectId
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp: clientFirebaseApp,
        fireCMSBackend,
        signInOptions
    });

    const saasUser = useMemo(() => {
            if (currentProjectController.loading || authController.authLoading) return;
            const user = authController.user;
            if (!user) return;
            return currentProjectController.users.find((saasUser) => saasUser.email === user?.email);
        },
        [authController.authLoading, authController.user, currentProjectController.loading, currentProjectController.users]);

    const {
        delegatedLoginLoading,
        delegatedLoginError
    } = useDelegatedLogin({
        projectsApi: fireCMSBackend.projectsApi,
        firebaseApp: clientFirebaseApp,
        getBackendAuthToken: fireCMSBackend.getBackendAuthToken,
        projectId,
        onUserChanged: (user) => {
            console.log("User changed", user)
            authController.setUser(user ?? null);
        }
    });

    const permissions: PermissionsBuilder<PersistedCollection, SaasUser> = useCallback(({
                                                                                            pathSegments,
                                                                                            collection,
                                                                                            user
                                                                                        }) => resolveSaasPermissions({
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
        if (!saasUser) {
            setNotValidUser(user);
            throw Error("No user was found with email " + user.email);
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(currentProjectController.roles, saasUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, currentProjectController.loading, currentProjectController.roles, currentProjectController.users, saasUser]);

    if (notValidUser) {
        return <NoAccessError/>
    }

    if (currentProjectController.loading) {
        return <CircularProgressCenter/>;
    }

    if (currentProjectController.configError) {
        return <ErrorView
            error={currentProjectController.configError as Error}/>
    }

    if (firebaseConfigLoading) {
        return <CircularProgressCenter/>;
    }

    if (firebaseConfigError || !clientFirebaseApp) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={firebaseConfigError ?? "Error fetching client Firebase config"}/>
        </CenteredView>;
    }

    if (delegatedLoginError) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={delegatedLoginError}/>
        </CenteredView>;
    }

    if (delegatedLoginLoading || firebaseConfigLoading || !clientFirebaseApp) {
        return <CircularProgressCenter/>;
    }

    if (!authController.user) {
        return <CircularProgressCenter/>;
    }

    if (!saasUser) {
        return <NoAccessError/>;
    }

    return <FireCMS3AppAuthenticated
        fireCMSUser={saasUser}
        fireCMSBackend={fireCMSBackend}
        onFirebaseInit={onFirebaseInit}
        authController={authController}
        currentProjectController={currentProjectController}
        collectionConfigController={configController}
        firebaseApp={clientFirebaseApp}
        {...props}
    />;
}

function NoAccessError() {
    return <CenteredView maxWidth={"md"} fullScreen={true}>
        <ErrorView title={"You don't have access to this project"}
                   error={"You can request permission to the owner"}/>
    </CenteredView>;
}

function FireCMS3AppAuthenticated({
                                      fireCMSUser,
                                      firebaseApp,
                                      currentProjectController,
                                      collectionConfigController,
                                      appCheckOptions,
                                      textSearchController,
                                      config,
                                      dateTimeFormat,
                                      locale,
                                      basePath,
                                      baseCollectionPath,
                                      onAnalyticsEvent,
                                      authController,
                                      modeController,
                                      fireCMSBackend,
                                      FireCMSAppBarComponent
                                  }: Omit<FireCMS3ClientProps, "projectId"> & {
    fireCMSUser: SaasUser;
    firebaseApp: FirebaseApp;
    currentProjectController: ProjectConfig;
    fireCMSBackend: FireCMSBackend,
    collectionConfigController: CollectionsConfigController;
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMS3AppAuthenticated with an authenticated user");
    }

    const customSaasRoutes = useMemo(buildSaasRoutes, []);

    const configPermissions: CollectionEditorPermissionsBuilder<User, PersistedCollection> = useCallback(({
                                                                                                              user,
                                                                                                              collection
                                                                                                          }) => resolveCollectionConfigPermissions({
        user: fireCMSUser,
        currentProjectController,
        collection
    }), [currentProjectController, fireCMSUser]);

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
            const saasUser = currentProjectController.users.find(u => u.uid === uid);
            console.log("Getting user", uid, saasUser);
            return saasUser ?? null;
        },
        collectionInference: buildCollectionInference(firebaseApp)
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: SaasDataEnhancementSubscriptionMessage,
        host: fireCMSBackend.backendApiHost,
    });

    const {
        appCheckLoading,
        getAppCheckToken
    } = useInitializeAppCheck({
        firebaseApp,
        options: appCheckOptions
    });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(currentProjectController.projectName ?? "FireCMS", currentProjectController.logo);

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useFirestoreDataSource({
        firebaseApp,
        textSearchController,
        firestoreIndexesBuilder: config?.firestoreIndexesBuilder
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    if (appCheckLoading) {
        return <CircularProgressCenter/>
    }

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={config?.collections}
                            views={config?.views}
                            fields={config?.fields}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dateTimeFormat={dateTimeFormat}
                            dataSource={dataSource}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                            locale={locale}
                            basePath={basePath}
                            baseCollectionPath={baseCollectionPath}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={[collectionEditorPlugin, dataEnhancementPlugin]}>
                            {({
                                  context,
                                  loading
                              }) => {

                                let component;
                                if (loading) {
                                    component = <CircularProgressCenter size={"large"}/>;
                                } else {
                                    component = (
                                        <Scaffold
                                            name={currentProjectController.projectName ?? "FireCMS"}
                                            logo={currentProjectController.logo}
                                            Drawer={SaasDrawer}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={config?.fireCMSAppBarComponentProps}
                                            autoOpenDrawer={config?.autoOpenDrawer}>
                                            <NavigationRoutes
                                                HomePage={config?.HomePage ?? SaasProjectPage}
                                                customRoutes={customSaasRoutes}/>
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

function buildSaasRoutes() {
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
