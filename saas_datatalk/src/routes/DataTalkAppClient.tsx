import {
    CircularProgressCenter,
    ErrorView,
    FireCMS,
    FireCMSAppBarProps,
    FireCMSPlugin,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildNavigationController,
    useModeController,
    User,
} from "@firecms/core";
import React, { useEffect, useMemo, useState } from "react";
import { Route, useParams } from "react-router-dom";
import { FirebaseApp } from "firebase/app";
import "@fontsource/jetbrains-mono";
import "typeface-rubik";
import {
    Button,
    CenteredView,
    ErrorIcon,
    FirebaseAuthController,
    FireCMSBackend,
    FireCMSBackEndProvider,
    FireCMSClientProps,
    FireCMSCloudUser,
    FireCMSCloudUserWithRoles,
    ProjectConfig,
    ProjectConfigProvider,
    ProjectSettings,
    useBuildCloudUserManagement,
    useBuildProjectConfig,
    useDelegatedLogin,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase
} from "@firecms/cloud";
import { SaasCMSAppBar } from "../components/SaasAppBar";
import { saveRecentProject } from "../utils/recent_projects_prefs";
import { WebappCreationView } from "../components/WebappCreationView";
import { RolesView, UserManagement, UserManagementProvider, UsersView } from "@firecms/user_management";
import { useImportExportPlugin } from "@firecms/data_import_export";
import { Typography } from "@firecms/ui";

export const DataTalkAppClient = function SaasCMSAppClient({
                                                               fireCMSBackend,
                                                               onAnalyticsEvent
                                                           }: {
    fireCMSBackend: FireCMSBackend,
    onAnalyticsEvent: (event: string, projectId: string, params?: object) => void;
}) {

    const modeController = useModeController();

    const { projectId } = useParams();
    if (!projectId) {
        throw new Error("DataTalkAppClient: projectId is undefined");
    }

    useEffect(() => {
        if (fireCMSBackend.backendUid)
            saveRecentProject(fireCMSBackend.backendUid, projectId)
    }, [fireCMSBackend.backendUid, projectId]);

    return <DataTalkAppClientInner
        projectId={projectId}
        modeController={modeController}
        fireCMSBackend={fireCMSBackend}
        basePath={`/p/${projectId}`}
        FireCMSAppBarComponent={SaasCMSAppBar}
        onAnalyticsEvent={(event: string, data?: object) => onAnalyticsEvent(event, projectId, data)}/>;

};

function DataTalkAppClientInner({
                                    projectId,
                                    modeController,
                                    fireCMSBackend,
                                    onAnalyticsEvent
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

    if (!userManagement.loading && projectConfig.clientFirebaseMissing) {
        return <WebappCreationView projectId={projectId}/>;
    }

    if (userManagement.loading || (!projectConfig.clientFirebaseConfig && !projectConfig.configError)) {
        return <FullLoadingView projectId={projectId}
                                projectConfig={projectConfig}
                                FireCMSAppBarComponent={SaasCMSAppBar}
                                text={"Project loading"}
        />;
    }

    return <FireCMSClientWithController
        key={"project_" + projectId}
        projectId={projectId}
        userManagement={userManagement}
        projectConfig={projectConfig}
        modeController={modeController}
        fireCMSBackend={fireCMSBackend}
        basePath={`/p/${projectId}`}
        FireCMSAppBarComponent={SaasCMSAppBar}
        onAnalyticsEvent={(event: string, data?: object) => onAnalyticsEvent?.(event, data)}/>;

};

export function FireCMSClientWithController({
                                                projectConfig,
                                                userManagement,
                                                projectId,
                                                fireCMSBackend,
                                                ...props
                                            }: FireCMSClientProps & {
    userManagement: UserManagement<FireCMSCloudUserWithRoles>;
    projectConfig: ProjectConfig;
    projectId: string;
}) {

    const [notValidUser, setNotValidUser] = useState<User | undefined>();

    const {
        firebaseApp: clientFirebaseApp,
        firebaseConfigLoading,
        configError: firebaseConfigError
    } = useInitialiseFirebase({
        firebaseConfig: projectConfig.clientFirebaseConfig
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

    let loadingOrErrorComponent;
    if (userManagement.loading) {
        loadingOrErrorComponent = <CircularProgressCenter text={"Project loading"}/>;
    } else if (delegatedLoginError) {
        loadingOrErrorComponent = <ErrorView error={delegatedLoginError}/>;
    } else if (notValidUser) {
        console.warn("No user was found with email " + notValidUser.email);
        loadingOrErrorComponent = <NoAccessError authController={authController}/>
    } else if (projectConfig.configError) {
        loadingOrErrorComponent = <NoAccessErrorView configError={projectConfig.configError}
                                                     onLogout={fireCMSBackend.signOut}/>
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
        authController={authController}
        projectConfig={projectConfig}
        firebaseApp={clientFirebaseApp!}
        userManagement={userManagement}
        {...props}
    />;
}

function FireCMSAppAuthenticated({
                                     fireCMSUser,
                                     firebaseApp,
                                     projectConfig,
                                     userManagement,
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
    authController: FirebaseAuthController;
}) {

    if (!authController.user) {
        throw Error("You can only use FireCMSAppAuthenticated with an authenticated user");
    }

    // const adminRoutes = useMemo(() => buildAdminRoutes(userManagement.usersLimit), [userManagement.usersLimit]);

    const importExportPlugin = useImportExportPlugin({
        onAnalyticsEvent
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
        userConfigPersistence,
        dataSourceDelegate: firestoreDelegate
    });

    const plugins: FireCMSPlugin<any, any, any>[] = [importExportPlugin];
    const adminRoutes = useMemo(() => buildAdminRoutes(userManagement.usersLimit), [userManagement.usersLimit]);

    return (
        <FireCMSBackEndProvider {...fireCMSBackend}>
            <ProjectConfigProvider config={projectConfig}>
                <UserManagementProvider userManagement={userManagement}>
                    <SnackbarProvider>
                        <ModeControllerProvider value={modeController}>
                            <FireCMS
                                navigationController={navigationController}
                                authController={authController}
                                userConfigPersistence={userConfigPersistence}
                                dataSourceDelegate={firestoreDelegate}
                                storageSource={storageSource}
                                entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                                onAnalyticsEvent={onAnalyticsEvent}
                                plugins={plugins}
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
                                                FireCMSAppBar={FireCMSAppBarComponent}>
                                                <CircularProgressCenter text={"Almost there"}/>
                                            </Scaffold>;
                                    } else {
                                        component = (
                                            <Scaffold
                                                key={"project_scaffold_" + projectConfig.projectId}
                                                name={projectConfig.projectName ?? ""}
                                                logo={projectConfig.logo}
                                                // Drawer={FireCMSCloudDrawer}
                                                FireCMSAppBar={FireCMSAppBarComponent}>
                                                <NavigationRoutes
                                                    // HomePage={ FireCMSCloudHomePage}
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

function NoAccessError({ authController }: {
    authController: FirebaseAuthController
}) {
    return <CenteredView maxWidth={"md"} className={"gap-4"}>
        <ErrorView title={"You don't have access to this project"}
                   error={"You can request permission to the owner"}/>
        <Button variant="text" onClick={authController.signOut}>Sign out</Button>
    </CenteredView>;
}

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

function buildAdminRoutes(usersLimit?: number) {

    return [
        {
            path: "users",
            name: "CMS Users",
            group: "Admin",
            icon: "face",
            hideFromNavigation: true,
            view: <UsersView>
                {/*<SubscriptionPlanWidget*/}
                {/*    showForPlans={["free"]}*/}
                {/*    message={<>Upgrade to PLUS to remove the <b>{usersLimit} users limit</b></>}/>*/}
            </UsersView>
        },
        {
            path: "roles",
            name: "Roles",
            group: "Admin",
            icon: "gpp_good",
            hideFromNavigation: true,
            view: <RolesView>
                {/*<SubscriptionPlanWidget*/}
                {/*    showForPlans={["free"]}*/}
                {/*    message={<>Upgrade to PLUS to be able to customise <b>roles</b></>}/>*/}
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
