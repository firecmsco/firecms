import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppCheckOptions,
    BreadcrumbUpdater,
    CenteredView,
    CircularProgressCenter,
    CMSAnalyticsEvent,
    ErrorView,
    FireCMS,
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
    CollectionsConfigController,
    ConfigPermissionsBuilder,
    PersistedCollection,
    useCollectionEditorPlugin
} from "@firecms/collection_editor";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import {
    FireCMSBackEndProvider,
    ProjectConfig,
    ProjectConfigProvider,
    useBuildCollectionsConfigController,
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
import { ADMIN_VIEWS, getUserRoles, RESERVED_GROUPS, resolveConfigPermissions, resolveSaasPermissions } from "./utils";
import { SaasDataEnhancementSubscriptionMessage, SaasDrawer, SaasLoginView } from "./components";
import { buildCollectionInference } from "./collection_editor/infer_collection";
import { buildProjectsApi, ProjectsApi } from "./api/projects";
import { useBuildFireCMSAuthController } from "./hooks/useBuildFireCMSAuthController";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

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
    const projectsApi = buildProjectsApi(backendApiHost);

    const {
        firebaseApp: backendFirebaseApp,
        firebaseConfigLoading: backendConfigLoading,
        configError,
        firebaseConfigError: backendFirebaseConfigError
    } = useInitialiseFirebase({
        fromUrl: backendApiHost + "/config"
    });

    const fireCMSController = useBuildFireCMSAuthController({
        backendFirebaseApp,
        projectsApi
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

    if (fireCMSController.authLoading) {
        return <CircularProgressCenter/>;
    }

    if (!fireCMSController.user) {
        return <SaasLoginView
            authController={fireCMSController}
            includeLogo={true}
            includeGoogleAdminScopes={false}
            includeTermsAndNewsLetter={false}
            includeGoogleDisclosure={false}/>
    }

    return <BrowserRouter basename={basePath}>
        <FireCMS3ConfigLoad
            fireCMSController={fireCMSController}
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

type FireCMS3AppInternalProps = {
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
};

export function FireCMS3ConfigLoad({
                                       projectId,
                                       fireCMSController,
                                       ...props
                                   }: FireCMS3AppInternalProps & {
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    fireCMSController: FireCMSBackend,
    projectId: string;
}) {

    const currentProjectController = useBuildProjectConfig({
        projectId,
        getBackendAuthToken: fireCMSController.getBackendAuthToken,
        backendFirebaseApp: fireCMSController.backendFirebaseApp,
        projectsApi: fireCMSController.projectsApi
    });

    if (!currentProjectController.clientFirebaseConfig) {
        return <CircularProgressCenter/>;
    }

    return <FireCMS3Glue
        projectId={projectId}
        currentProjectController={currentProjectController}
        firecmsBackend={fireCMSController}
        {...props}
    />;
}

export function FireCMS3Glue({
                                 currentProjectController,
                                 projectId,
                                 onFirebaseInit,
                                 firecmsBackend,
                                 signInOptions,
                                 ...props
                             }: FireCMS3AppInternalProps & {
    currentProjectController: ProjectConfig;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    firecmsBackend: FireCMSBackend,
    projectId: string;
}) {

    const {
        firebaseApp: clientFirebaseApp,
        firebaseConfigLoading,
        configError: firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig: currentProjectController.clientFirebaseConfig,
        name: projectId
    });
    const {
        delegatedLoginLoading,
        delegatedLoginError
    } = useDelegatedLogin({
        projectsApi: firecmsBackend.projectsApi,
        firebaseApp: clientFirebaseApp,
        getBackendAuthToken: firecmsBackend.getBackendAuthToken,
        projectId,
        onUserChanged: (user) => {
            authController.setUser(user ?? null);
        }
    });

    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp: clientFirebaseApp,
        firecmsBackend,
        signInOptions
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
        firebaseApp: firecmsBackend.backendFirebaseApp,
        projectId,
        permissions
    });

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

    return <FireCMS3AppAuthenticated
        firecmsBackend={firecmsBackend}
        onFirebaseInit={onFirebaseInit}
        authController={authController}
        currentProjectController={currentProjectController}
        configController={configController}
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

export function FireCMS3AppAuthenticated({
                                             firebaseApp,
                                             currentProjectController,
                                             configController,
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
                                             firecmsBackend
                                         }: FireCMS3AppInternalProps & {
    firebaseApp: FirebaseApp;
    currentProjectController: ProjectConfig;
    firecmsBackend: FireCMSBackend,
    configController: CollectionsConfigController;
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMS3AppAuthenticated with an authenticated user");
    }

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    useEffect(() => {
        if (currentProjectController.loading) return;
        const user = authController.user;
        if (!user) return;
        const saasUser = currentProjectController.users.find((saasUser) => saasUser.email === user?.email)
        if (!saasUser) {
            setNotValidUser(user);
            throw Error("No user was found with email " + user.email);
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(currentProjectController.roles, saasUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, currentProjectController.loading, currentProjectController.roles, currentProjectController.users]);

    const customSaasRoutes = useMemo(buildSaasRoutes, []);

    const configPermissions: ConfigPermissionsBuilder<User, PersistedCollection> = useCallback(({
                                                                                                    user,
                                                                                                    collection
                                                                                                }) => resolveConfigPermissions({
        user,
        currentProjectController,
        collection
    }), [currentProjectController]);

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        configController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        pathSuggestions: [],
        getOwnerName: (ownerId) => {
            const saasUser = currentProjectController.users.find(u => u.uid === ownerId);
            return saasUser?.name ?? saasUser?.email ?? ownerId;
        },
        collectionInference: buildCollectionInference(firebaseApp)
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: SaasDataEnhancementSubscriptionMessage,
        host: import.meta.env.VITE_API_SERVER as string,
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
        firestoreIndexesBuilder: config?.firestoreIndexesBuilder,
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    if (notValidUser) {
        return <NoAccessError/>
    }

    if (appCheckLoading) {
        return <CircularProgressCenter/>
    }

    return (
        <FireCMSBackEndProvider {...firecmsBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={[]}
                            views={config?.views}
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
                            plugins={[collectionEditorPlugin, dataEnhancementPlugin]}
                            fields={config?.fields}>
                            {({
                                  context,
                                  loading
                              }) => {

                                // return <MultiSelect/>;
                                let component;
                                if (loading) {
                                    component = <CircularProgressCenter size={"large"}/>;
                                } else {
                                    component = (
                                        <Scaffold
                                            name={currentProjectController.projectName ?? "FireCMS"}
                                            logo={currentProjectController.logo}
                                            Drawer={SaasDrawer}
                                            fireCMSAppBarComponentProps={config?.fireCMSAppBarComponentProps}
                                            autoOpenDrawer={config?.autoOpenDrawer}>
                                            <NavigationRoutes
                                                HomePage={config?.HomePage}
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
