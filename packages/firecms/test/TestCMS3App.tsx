import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppCheckOptions,
    Button,
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
} from "@firecms/core";

import {
    CollectionEditorPermissionsBuilder,
    CollectionsConfigController,
    PersistedCollection,
    useCollectionEditorPlugin
} from "@firecms/collection_editor";

import { FireCMSBackEndProvider, ProjectConfig, ProjectConfigProvider } from "../src/hooks";

import { FireCMS3AppProps } from "../src/FireCMS3AppProps";
import { FireCMSAppConfig, FireCMSBackend, FireCMSUser } from "../src/types";
import {
    ADMIN_VIEWS,
    getUserRoles,
    RESERVED_GROUPS,
    resolveCollectionConfigPermissions,
    resolveUserRolePermissions
} from "../src/utils";
import { FireCMSDrawer, FireCMSLoginView } from "../src/components";
import { FireCMSProjectHomePage } from "../src/components/FireCMSProjectHomePage";
import { useBuildMockFireCMSBackend } from "./mocks/useBuildMockFireCMSBackend";
import { useBuildMockProjectConfig } from "./mocks/useBuildMockProjectConfig";
import { useBuildMockAuthController } from "./mocks/useBuildMockAuthController";
import { useMockDelegatedLogin } from "./mocks/useDelegatedLogin";
import { useBuildMockCollectionsConfigController } from "./mocks/useBuildMockCollectionsConfigController";
import { useBuildMockDataSourceDelegate } from "./mocks/useBuildMockDataSource";
import { useBuildMockStorageSource } from "./mocks/useBuildMockStorageSource";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    FirestoreTextSearchController
} from "@firecms/firebase";
import { useImportExportPlugin } from "@firecms/data_import_export";

/**
 * This is the default implementation of a FireCMS app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity collections.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * and {@link NavigationRoutes} instead.
 *
 * @param props
 * @constructor
 * @group Firebase
 */
export function FireCMS3App({
                                projectId,
                                basePath,
                                baseCollectionPath,
                                onAnalyticsEvent,
                                appConfig,
                                backendApiHost = "https://api-kdoe6pj3qq-ey.a.run.app" // TODO
                            }: FireCMS3AppProps) {

    const modeController = useBuildModeController();

    const fireCMSBackend = useBuildMockFireCMSBackend();

    let component;

    if (!fireCMSBackend.user) {
        component = <CenteredView maxWidth={"lg"} fullScreen={true}>
            <FireCMSLoginView
                authController={fireCMSBackend}
                includeLogo={true}
                includeGoogleAdminScopes={false}
                includeTermsAndNewsLetter={false}
                includeGoogleDisclosure={false}/>
        </CenteredView>
    } else {
        component = <Mock3Client
            fireCMSBackend={fireCMSBackend}
            projectId={projectId}
            appConfig={appConfig}
            basePath={basePath}
            baseCollectionPath={baseCollectionPath}
            onAnalyticsEvent={onAnalyticsEvent}
            modeController={modeController}
        />
    }

    return <BrowserRouter basename={basePath}>
        {component}
    </BrowserRouter>;

}

export type Mock3ClientProps = {
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    fireCMSBackend: FireCMSBackend,
    projectId: string;
    appConfig?: FireCMSAppConfig;
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

function FullLoadingView(props: { projectId: string, projectConfig?: ProjectConfig }) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}
        name={props.projectConfig?.projectName ?? ""}
        logo={props.projectConfig?.logo}
        includeDrawer={false}>
        <CircularProgressCenter/>
    </Scaffold>;
}

export const Mock3Client = function Mock3Client({
                                                    projectId,
                                                    fireCMSBackend,
                                                    ...props
                                                }: Mock3ClientProps) {

    const projectConfig = useBuildMockProjectConfig();

    if (!projectConfig.clientFirebaseConfig) {
        return <FullLoadingView projectId={projectId} projectConfig={projectConfig}/>;
    }

    return <Mock3ClientInner
        projectId={projectId}
        projectConfig={projectConfig}
        fireCMSBackend={fireCMSBackend}
        {...props}
    />;
};

function Mock3ClientInner({
                              projectConfig,
                              projectId,
                              onFirebaseInit,
                              fireCMSBackend,
                              signInOptions,
                              ...props
                          }: Mock3ClientProps & {
    projectConfig: ProjectConfig;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    projectId: string;
}) {

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    const authController: FirebaseAuthController = useBuildMockAuthController();

    const saasUser = useMemo(() => {
            if (projectConfig.loading || authController.authLoading) return;
            const user = authController.user;
            if (!user) return;
            return projectConfig.users.find((saasUser) => saasUser.email === user?.email);
        },
        [authController.authLoading, authController.user, projectConfig.loading, projectConfig.users]);

    const {
        delegatedLoginLoading,
        delegatedLoginError
    } = useMockDelegatedLogin({
        onUserChanged: (user) => {
            console.log("User changed", user)
            authController.setUser(user ?? null);
        }
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

    const configController = useBuildMockCollectionsConfigController();

    useEffect(() => {
        if (projectConfig.loading) return;
        const user = authController.user;
        if (!user) return;
        if (!saasUser) {
            setNotValidUser(user);
            // throw Error("No user was found with email " + user.email);
        } else {
            setNotValidUser(undefined);
            const userRoles = getUserRoles(projectConfig.roles, saasUser);
            authController.setUserRoles(userRoles ?? null);
        }
    }, [authController.user, projectConfig.loading, projectConfig.roles, projectConfig.users, saasUser]);

    if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        return <NoAccessError authController={authController}/>
    }

    if (projectConfig.loading) {
        return <FullLoadingView projectId={projectId} projectConfig={projectConfig}/>;
    }

    if (projectConfig.configError) {
        return <ErrorView
            error={projectConfig.configError as Error}/>
    }

    if (delegatedLoginError) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
    }

    if (!authController.user) {
        return <FullLoadingView projectId={projectId} projectConfig={projectConfig}/>;
    }

    if (!saasUser) {
        return <NoAccessError authController={authController}/>;
    }

    return <Mock3AppAuthenticated
        fireCMSUser={saasUser}
        fireCMSBackend={fireCMSBackend}
        onFirebaseInit={onFirebaseInit}
        authController={authController}
        projectConfig={projectConfig}
        collectionConfigController={configController}
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

function Mock3AppAuthenticated({
                                   fireCMSUser,
                                   projectConfig,
                                   collectionConfigController,
                                   appCheckOptions,
                                   textSearchController,
                                   appConfig,
                                   dateTimeFormat,
                                   locale,
                                   basePath,
                                   baseCollectionPath,
                                   onAnalyticsEvent,
                                   authController,
                                   modeController,
                                   fireCMSBackend,
                                   FireCMSAppBarComponent
                               }: Omit<Mock3ClientProps, "projectId"> & {
    fireCMSUser: FireCMSUser;
    projectConfig: ProjectConfig;
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
        projectConfig,
        collection
    }), [projectConfig, fireCMSUser]);

    const importExportPlugin = useImportExportPlugin();

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions,
        reservedGroups: RESERVED_GROUPS,
        pathSuggestions: (path?) => {
            if (!projectConfig.projectId)
                throw Error("pathSuggestions: Project id not found");
            if (!path)
                return fireCMSBackend.projectsApi.getRootCollections(projectConfig.projectId);
            return Promise.resolve([]);
        },
        getUser: (uid) => {
            const saasUser = projectConfig.users.find(u => u.uid === uid);
            console.log("Getting user", uid, saasUser);
            return saasUser ?? null;
        },
    });

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(projectConfig.projectName ?? "", projectConfig.logo);

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSourceDelegate = useBuildMockDataSourceDelegate();

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useBuildMockStorageSource();

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            collections={appConfig?.collections}
                            views={appConfig?.views}
                            propertyConfigs={{}} // TODO
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dateTimeFormat={dateTimeFormat}
                            dataSourceDelegate={dataSourceDelegate}
                            storageSource={storageSource}
                            locale={locale}
                            basePath={basePath}
                            baseCollectionPath={baseCollectionPath}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={[importExportPlugin, collectionEditorPlugin]}
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
                                            key={"project_scaffold_" + projectConfig.projectId}
                                            name={projectConfig.projectName ?? ""}
                                            logo={projectConfig.logo}
                                            Drawer={FireCMSDrawer}
                                            FireCMSAppBarComponent={FireCMSAppBarComponent}
                                            fireCMSAppBarComponentProps={appConfig?.fireCMSAppBarComponentProps}
                                            autoOpenDrawer={appConfig?.autoOpenDrawer}>
                                            <NavigationRoutes
                                                HomePage={appConfig?.HomePage ?? FireCMSProjectHomePage}
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
        element={view}
    />)
}

