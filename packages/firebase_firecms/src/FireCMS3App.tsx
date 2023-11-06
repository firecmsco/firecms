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

function FullLoadingView(props: { projectId: string, currentProjectController?: ProjectConfig, text?: string }) {
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
                                                 customization,
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
        onFirebaseInit: customization?.onFirebaseInit,
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

    if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        return <NoAccessError authController={authController}/>
    }

    if (currentProjectController.loading) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Project loading"}/>;
    }

    if (currentProjectController.configError) {
        return <ErrorView
            error={currentProjectController.configError as Error}/>
    }

    if (delegatedLoginError) {
        return <CenteredView fullScreen={true}>
            <Typography variant={"h4"}>Error delegating login</Typography>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
    }

    if (customizationLoading) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Project customization loading"}/>;
    }

    if (firebaseConfigLoading) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Client config loading"}/>;
    }

    if (firebaseConfigError || !clientFirebaseApp) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={firebaseConfigError ?? "Error fetching client Firebase config"}/>
        </CenteredView>;
    }

    if (delegatedLoginLoading) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Delegating client login"}/>;
    }

    if (!authController.user) {
        return <FullLoadingView projectId={projectId}
                                currentProjectController={currentProjectController}
                                text={"Auth loading"}/>;
    }

    if (!fireCMSUser) {
        return <NoAccessError authController={authController}/>;
    }

    return <FireCMS3AppAuthenticated
        fireCMSUser={fireCMSUser}
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
            const fireCMSUser = currentProjectController.users.find(u => u.uid === uid);
            console.log("Getting user", uid, fireCMSUser);
            return fireCMSUser ?? null;
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

    const fieldsMap = useMemo(() => {
        const fieldsMap: Record<string, any> = {};
        customization?.fields?.forEach(field => {
            fieldsMap[field.key] = field;
        });
        return fieldsMap;
    }, [customization?.fields]);

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={customization?.collections}
                            dateTimeFormat={customization?.dateTimeFormat}
                            views={customization?.views}
                            entityViews={customization?.entityViews}
                            locale={customization?.locale}
                            fields={fieldsMap}
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dataSource={dataSource}
                            storageSource={storageSource}
                            entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
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
                                    component =
                                        <Scaffold
                                            key={"project_scaffold_" + currentProjectController.projectId}
                                            name={currentProjectController.projectName ?? ""}
                                            logo={currentProjectController.logo}
                                            includeDrawer={false}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={customization?.fireCMSAppBarComponentProps}>
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
                                            fireCMSAppBarComponentProps={customization?.fireCMSAppBarComponentProps}
                                            autoOpenDrawer={customization?.autoOpenDrawer}>
                                            <NavigationRoutes
                                                HomePage={customization?.HomePage ?? FireCMSProjectHomePage}
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

