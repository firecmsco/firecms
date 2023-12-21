import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    AppCheckOptions,
    BreadcrumbUpdater,
    Button,
    CenteredView,
    CircularProgressCenter,
    CMSAnalyticsEvent,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
    FireCMSPlugin,
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
    useBuildNavigationController,
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
import { useBuildMockDataSource } from "./mocks/useBuildMockDataSource";
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

function FullLoadingView(props: { projectId: string, currentProjectController?: ProjectConfig }) {
    return <Scaffold
        key={"project_scaffold_" + props.projectId}
        name={props.currentProjectController?.projectName ?? ""}
        logo={props.currentProjectController?.logo}
        includeDrawer={false}>
        <CircularProgressCenter/>
    </Scaffold>;
}

export const Mock3Client = function Mock3Client({
                                                    projectId,
                                                    fireCMSBackend,
                                                    ...props
                                                }: Mock3ClientProps) {

    const currentProjectController = useBuildMockProjectConfig();

    if (!currentProjectController.clientFirebaseConfig) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    return <Mock3ClientInner
        projectId={projectId}
        currentProjectController={currentProjectController}
        fireCMSBackend={fireCMSBackend}
        {...props}
    />;
};

function Mock3ClientInner({
                              currentProjectController,
                              projectId,
                              onFirebaseInit,
                              fireCMSBackend,
                              signInOptions,
                              ...props
                          }: Mock3ClientProps & {
    currentProjectController: ProjectConfig;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    projectId: string;
}) {

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    const authController: FirebaseAuthController = useBuildMockAuthController();

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
        if (currentProjectController.loading) return;
        const user = authController.user;
        if (!user) return;
        if (!saasUser) {
            setNotValidUser(user);
            // throw Error("No user was found with email " + user.email);
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

    if (delegatedLoginError) {
        return <CenteredView fullScreen={true}>
            <ErrorView error={delegatedLoginError}/>
            <Button variant="text" onClick={authController.signOut}>Sign out</Button>
        </CenteredView>;
    }

    if (!authController.user) {
        return <FullLoadingView projectId={projectId} currentProjectController={currentProjectController}/>;
    }

    if (!saasUser) {
        return <NoAccessError authController={authController}/>;
    }

    return <Mock3AppAuthenticated
        fireCMSUser={saasUser}
        fireCMSBackend={fireCMSBackend}
        onFirebaseInit={onFirebaseInit}
        authController={authController}
        currentProjectController={currentProjectController}
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
                                   currentProjectController,
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

    const collectionEditorPlugin = useCollectionEditorPlugin({
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
    });

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
    const dataSource = useBuildMockDataSource();

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useBuildMockStorageSource();

    const plugins: FireCMSPlugin<any, any, any>[] = [importExportPlugin, collectionEditorPlugin];

    const navigationController = useBuildNavigationController({
        basePath,
        baseCollectionPath,
        authController,
        collections: appConfig?.collections,
        views: appConfig?.views,
        userConfigPersistence,
        dataSource,
        plugins
    });

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={currentProjectController}>
                <SnackbarProvider>
                    <ModeControllerProvider
                        value={modeController}>
                        <FireCMS
                            navigationController={navigationController}
                            propertyConfigs={{}} // TODO
                            authController={authController}
                            userConfigPersistence={userConfigPersistence}
                            dateTimeFormat={dateTimeFormat}
                            dataSource={dataSource}
                            storageSource={storageSource}
                            locale={locale}
                            onAnalyticsEvent={onAnalyticsEvent}
                            plugins={plugins}
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
        element={
            <BreadcrumbUpdater
                path={path}
                key={`navigation_admin_${path}`}
                title={name}>
                {view}
            </BreadcrumbUpdater>}
    />)
}

