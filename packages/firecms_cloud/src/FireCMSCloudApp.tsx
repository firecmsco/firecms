import React, { useCallback, useMemo, useState } from "react";
import { FirebaseApp } from "firebase/app";
import { BrowserRouter, Route } from "react-router-dom";

import {
    CircularProgressCenter,
    EntityCollection,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
    FireCMSPlugin,
    joinCollectionLists,
    makePropertiesEditable,
    ModeController,
    ModeControllerProvider,
    ModifyCollectionProps,
    NavigationRoutes,
    PermissionsBuilder,
    Properties,
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
    useDelegatedLogin,
    useFirestoreCollectionsConfigController,
} from "./hooks";

import { FireCMSAppProps } from "./FireCMSAppProps";
import { ApiError, FireCMSAppConfig, FireCMSBackend, FireCMSCloudUser, FireCMSCloudUserWithRoles } from "./types";
import { RESERVED_GROUPS, resolveCollectionConfigPermissions } from "./utils";
import {
    FireCMSCloudDrawer,
    FireCMSDataEnhancementSubscriptionMessage,
    FireCMSLoginView,
    ProjectSettings,
    SubscriptionPlanWidget
} from "./components";
import { FireCMSCloudHomePage } from "./components/FireCMSCloudHomePage";
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
import { Button, CenteredView, ErrorIcon, Typography } from "@firecms/ui";
import { useSaasPlugin } from "./hooks/useSaasPlugin";
import {
    resolveUserRolePermissions,
    RolesView,
    UserManagement,
    UserManagementProvider,
    UsersView
} from "@firecms/user_management";

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

function ErrorDelegatingLoginView(props: { configError: Error | ApiError, onLogout: () => void }) {
    let errorBody: JSX.Element;
    if ("code" in props.configError && props.configError.code === "firecms-user-not-found") {
        errorBody = <>
            <Typography>
                The user trying to log in is not registered in the client project.
            </Typography>
            <Typography>
                Make sure the user exists in the client project and try again.
                If the problem persists, reach us at <a href="mailto:hello@firecms.co?subject=FireCMS%20login%20error"
                                                        rel="noopener noreferrer"
                                                        target="_blank">
                hello@firecms.co </a>, or in our <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>.
            </Typography>
        </>;
    } else {
        errorBody = <>
            <Typography>{props.configError.message}</Typography>
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
    }
    return <CenteredView maxWidth={"2xl"} className={"flex flex-col gap-4"}>
        <div className={"flex gap-4 items-center"}>
            <ErrorIcon color={"error"}/>
            <Typography variant={"h4"}>Error logging in</Typography>
        </div>
        {errorBody}
        <Button variant="outlined" onClick={props.onLogout}>Sign out</Button>
    </CenteredView>;
}

function NoAccessErrorView(props: { configError: Error, onLogout: () => void }) {
    return <CenteredView maxWidth={"2xl"} className={"flex flex-col gap-4"}>
        <div className={"flex gap-4 items-center"}>
            <ErrorIcon color={"error"}/>
            <Typography variant={"h4"}>Error accessing project</Typography>
        </div>
        <Typography>{props.configError.message}</Typography>
        <Typography>
            This error may be caused when trying to access with a user that is not
            registered in the project. You can ask the project owner to add you to the project.
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
        firebaseConfig: projectConfig.clientFirebaseConfig,
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
        configPath: `projects/${projectId}`,
        permissions,
        propertyConfigs: appConfig?.propertyConfigs
    });

    let loadingOrErrorComponent;
    if (userManagement.loading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project loading"}/>;
    } else if (delegatedLoginError) {
        loadingOrErrorComponent = <ErrorDelegatingLoginView configError={delegatedLoginError}
                                                            onLogout={fireCMSBackend.signOut}/>
    } else if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        loadingOrErrorComponent = <NoAccessError authController={authController}/>
    } else if (projectConfig.configError) {
        loadingOrErrorComponent = <NoAccessErrorView configError={projectConfig.configError}
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
    fireCMSUser: FireCMSCloudUser;
    firebaseApp: FirebaseApp;
    projectConfig: ProjectConfig;
    userManagement: UserManagement<FireCMSCloudUserWithRoles>;
    fireCMSBackend: FireCMSBackend,
    collectionConfigController: CollectionsConfigController;
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMSAppAuthenticated with an authenticated user");
    }

    const adminRoutes = useMemo(() => buildAdminRoutes(userManagement.usersLimit), [userManagement.usersLimit]);

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
            (collections: EntityCollection[]) => injectCollections(
                collections,
                collectionConfigController.collections ?? [],
                appConfig?.modifyCollection
            ),
            [appConfig?.modifyCollection, collectionConfigController.collections]),
    });

    const introMode = navigationController.collections !== undefined && navigationController.collections.length === 0;
    const saasPlugin = useSaasPlugin({
        projectConfig,
        firestoreDelegate,
        collectionConfigController,
        appConfig,
        introMode
    });

    const collectionEditorPlugin = useCollectionEditorPlugin<PersistedCollection, User>({
        collectionConfigController,
        configPermissions,
        introMode: introMode ? (projectConfig.creationType === "new" ? "new_project" : "existing_project") : undefined,
        reservedGroups: RESERVED_GROUPS,
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

    const plugins: FireCMSPlugin<any, any, any>[] = [importExportPlugin, collectionEditorPlugin, saasPlugin, dataEnhancementPlugin];

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <UserManagementProvider userManagement={userManagement}>
                    <SnackbarProvider>
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
                                                Drawer={FireCMSCloudDrawer}
                                                FireCMSAppBar={FireCMSAppBarComponent}
                                                fireCMSAppBarProps={appConfig?.fireCMSAppBarComponentProps}
                                                autoOpenDrawer={appConfig?.autoOpenDrawer}>
                                                <NavigationRoutes
                                                    HomePage={appConfig?.HomePage ?? FireCMSCloudHomePage}
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

/**
 * Function in charge of merging collections defined in code with those stored in the backend.
 */
const injectCollections = (baseCollections: EntityCollection[],
                           backendCollections: PersistedCollection[],
                           modifyCollection?: (props: ModifyCollectionProps) => EntityCollection | void
) => {

    const markAsEditable = (c: PersistedCollection) => {
        makePropertiesEditable(c.properties as Properties);
        c.subcollections?.forEach(markAsEditable);
    };
    const storedCollections = backendCollections ?? [];
    storedCollections.forEach(markAsEditable);

    console.debug("Collections specified in code:", baseCollections);
    console.debug("Collections stored in the backend", storedCollections);
    const result = joinCollectionLists(baseCollections, storedCollections, [], modifyCollection);
    console.debug("Collections after joining:", result);
    return result;
}

function buildAdminRoutes(usersLimit?: number) {

    return [
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
    ].map(({
               path,
               name,
               view
           }) => <Route
        key={"navigation_admin_" + path}
        path={path}
        element={view}
    />)
}
