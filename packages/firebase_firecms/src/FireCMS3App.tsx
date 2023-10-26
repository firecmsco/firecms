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
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    User
} from "@firecms/core";

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
    useInitialiseFirebase
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
import { getFirestoreDataInPath } from "./utils/database";
import { useImportExportPlugin } from "./hooks/useImportExportPlugin";

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
                                customization,
                                backendApiHost = "https://api-kdoe6pj3qq-ey.a.run.app", // TODO
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
        component = <FullLoadingView projectId={projectId}/>;
    } else if (backendFirebaseConfigError) {
        component = <ErrorView
            error={backendFirebaseConfigError}/>
    } else if (configError) {
        component = <ErrorView
            error={configError}/>
    } else if (fireCMSBackend.authLoading) {
        component = <FullLoadingView projectId={projectId}/>;
    } else if (!fireCMSBackend.user) {
        component = <CenteredView maxWidth={"lg"} fullScreen={true}>
            <SaasLoginView
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
            customization={customization}
            basePath={basePath}
            baseCollectionPath={baseCollectionPath}
            onAnalyticsEvent={onAnalyticsEvent}
        />
    }

    return <BrowserRouter basename={basePath}>
        {component}
    </BrowserRouter>;

}

export type FireCMS3ClientProps = {
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    fireCMSBackend: FireCMSBackend,
    projectId: string;
    customization?: FireCMSCustomization;
    modeController: ModeController;
    FireCMSAppBarComponent?: React.ComponentType<FireCMSAppBarProps>;
    basePath?: string;
    baseCollectionPath?: string;
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
};

function FullLoadingView(props: { projectId: string, currentProjectController?: ProjectConfig }) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}
        name={props.currentProjectController?.projectName ?? ""}
        logo={props.currentProjectController?.logo}
        includeDrawer={false}>
        <CircularProgressCenter/>
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
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    return <FireCMS3ClientWithController
        projectId={projectId}
        currentProjectController={currentProjectController}
        fireCMSBackend={fireCMSBackend}
        {...props}
    />;
};

export function FireCMS3ClientWithController({
                                                 currentProjectController,
                                                 projectId,
                                                 fireCMSBackend,
                                                 signInOptions,
                                                 customization,
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
        onFirebaseInit: customization?.onFirebaseInit,
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
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(currentProjectController.roles, saasUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, currentProjectController.loading, currentProjectController.roles, currentProjectController.users, saasUser]);

    if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        return <NoAccessError authController={authController}/>
    }

    if (currentProjectController.loading) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    if (currentProjectController.configError) {
        return <ErrorView
            error={currentProjectController.configError as Error}/>
    }

    if (firebaseConfigLoading) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    if (firebaseConfigError || !clientFirebaseApp) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={firebaseConfigError ?? "Error fetching client Firebase config"}/>
        </CenteredView>;
    }

    if (delegatedLoginError) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
    }

    if (delegatedLoginLoading || firebaseConfigLoading || !clientFirebaseApp) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    if (!authController.user) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    if (!saasUser) {
        return <NoAccessError authController={authController}/>;
    }

    return <FireCMS3AppAuthenticated
        fireCMSUser={saasUser}
        fireCMSBackend={fireCMSBackend}
        customization={customization}
        authController={authController}
        currentProjectController={currentProjectController}
        collectionConfigController={configController}
        firebaseApp={clientFirebaseApp}
        {...props}
    />;
}

function NoAccessError({ authController }: { authController: FirebaseAuthController }) {
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
                                      customization,
                                      authController,
                                      modeController,
                                      fireCMSBackend,
                                      FireCMSAppBarComponent,
                                      onAnalyticsEvent,
                                      basePath,
                                      baseCollectionPath
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
            const saasUser = currentProjectController.users.find(u => u.uid === uid);
            console.log("Getting user", uid, saasUser);
            return saasUser ?? null;
        },
        collectionInference: buildCollectionInference(firebaseApp),
        getData: (path) => getFirestoreDataInPath(firebaseApp, path, 100)
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        SubscriptionMessage: SaasDataEnhancementSubscriptionMessage,
        host: fireCMSBackend.backendApiHost,
    });

    // const {
    //     appCheckLoading,
    // } = useInitializeAppCheck({
    //     firebaseApp,
    //     options: customization.appCheckOptions
    // });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(currentProjectController.projectName ?? "", currentProjectController.logo);

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useFirestoreDataSource({
        firebaseApp,
        textSearchController: customization?.textSearchController,
        firestoreIndexesBuilder: customization?.firestoreIndexesBuilder
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    // if (appCheckLoading) {
    //     return <FullLoadingView projectId={currentProjectController.projectId}
    //                             currentProjectController={currentProjectController}/>;
    // }

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={customization?.collections}
                            views={customization?.views}
                            fields={customization?.fields}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dateTimeFormat={customization?.dateTimeFormat}
                            dataSource={dataSource}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                            locale={customization?.locale}
                            basePath={basePath}
                            baseCollectionPath={baseCollectionPath}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={[importExportPlugin, collectionEditorPlugin, dataEnhancementPlugin]}
                        >
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
                                            key={"project_scaffold_" + currentProjectController.projectId}
                                            name={currentProjectController.projectName ?? ""}
                                            logo={currentProjectController.logo}
                                            Drawer={SaasDrawer}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={customization?.fireCMSAppBarComponentProps}
                                            autoOpenDrawer={customization?.autoOpenDrawer}>
                                            <NavigationRoutes
                                                HomePage={customization?.HomePage ?? SaasProjectPage}
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

function getRemoteConfig(arg0: string) {
    throw new Error("Function not implemented.");
}

