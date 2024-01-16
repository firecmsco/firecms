import React from "react";
import { GoogleAuthProvider } from "firebase/auth";
import { BrowserRouter } from "react-router-dom";

import {
    CircularProgressCenter,
    CMSAnalyticsEvent,
    CMSView,
    CMSViewsBuilder,
    DataSourceDelegate,
    EntityCollection,
    EntityCollectionsBuilder,
    FireCMS,
    FireCMSPlugin,
    Locale,
    ModeControllerProvider,
    NavigationRoutes,
    PropertyConfig,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    StorageSource,
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    UserConfigurationPersistence
} from "@firecms/core";

import { ComponentsRegistry, FireCMSProAppProps } from "./FireCMSProAppProps";
import { FirebaseLoginView } from "./components/FirebaseLoginView";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase,
    useInitializeAppCheck,
    useValidateAuthenticator
} from "@firecms/firebase";
import {
    FireCMSBackend,
    FireCMSBackEndProvider,
    ProjectConfigProvider,
    useBuildFireCMSBackend,
    useBuildProjectConfig
} from "firecms";
import { FirebaseApp } from "firebase/app";
import { CenteredView } from "@firecms/ui";

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
export function FireCMSProApp({
                                  name,
                                  logo,
                                  logoDark,
                                  toolbarExtraWidget,
                                  authentication,
                                  collections,
                                  views,
                                  textSearchControllerBuilder,
                                  allowSkipLogin,
                                  signInOptions = DEFAULT_SIGN_IN_OPTIONS,
                                  firebaseConfig,
                                  onFirebaseInit,
                                  appCheckOptions,
                                  dateTimeFormat,
                                  locale,
                                  basePath,
                                  baseCollectionPath,
                                  onAnalyticsEvent,
                                  propertyConfigs: propertyConfigsProp,
                                  plugins,
                                  autoOpenDrawer,
                                  firestoreIndexesBuilder,
                                  components,
                                  localTextSearchEnabled = false,
                                  backendApiHost = "https://api-drplyi3b6q-ey.a.run.app", // TODO
                              }: FireCMSProAppProps) {

    /**
     * Update the browser title and icon
     */
    useBrowserTitleAndIcon(name, logo);

    const propertyConfigs: Record<string, PropertyConfig> = (propertyConfigsProp ?? [])
        .map(pc => ({
            [pc.key]: pc
        }))
        .reduce((a, b) => ({ ...a, ...b }), {});

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig
    });

    const {
        appCheckLoading,
        getAppCheckToken
    } = useInitializeAppCheck({
        firebaseApp,
        options: appCheckOptions
    });

    /**
     * Controller for managing authentication
     */
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: textSearchControllerBuilder,
        firestoreIndexesBuilder: firestoreIndexesBuilder,
        localTextSearchEnabled
    })

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    /**
     * Validate authenticator
     */
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authentication,
        getAppCheckToken,
        appCheckForceRefresh: (appCheckOptions && appCheckOptions.forceRefresh) ? appCheckOptions.forceRefresh! : false,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const {
        firebaseApp: backendFirebaseApp,
        firebaseConfigLoading: backendConfigLoading,
        configError: backendConfigError,
        firebaseConfigError: backendFirebaseConfigError
    } = useInitialiseFirebase({
        fromUrl: backendApiHost + "/config"
    });

    const fireCMSBackend = useBuildFireCMSBackend({
        backendApiHost,
        backendFirebaseApp,
    });

    if (firebaseConfigLoading || !firebaseApp || appCheckLoading) {
        return <>
            <CircularProgressCenter/>
        </>;
    }

    return <FireCMSProInternal
        firebaseApp={firebaseApp}
        fireCMSBackend={fireCMSBackend}
        configError={configError}
        firebaseConfigLoading={firebaseConfigLoading}
        appCheckLoading={appCheckLoading}
        basePath={basePath}
        collections={collections}
        views={views}
        authController={authController}
        userConfigPersistence={userConfigPersistence}
        dateTimeFormat={dateTimeFormat}
        firestoreDelegate={firestoreDelegate}
        storageSource={storageSource}
        locale={locale}
        baseCollectionPath={baseCollectionPath}
        onAnalyticsEvent={onAnalyticsEvent}
        plugins={plugins}
        propertyConfigs={propertyConfigs}
        authLoading={authLoading}
        logoDark={logoDark}
        logo={logo}
        canAccessMainView={canAccessMainView}
        components={components}
        allowSkipLogin={allowSkipLogin}
        signInOptions={signInOptions}
        notAllowedError={notAllowedError}
        name={name}
        toolbarExtraWidget={toolbarExtraWidget}
        autoOpenDrawer={autoOpenDrawer}
    />;

}

function FireCMSProInternal({ firebaseApp, fireCMSBackend, configError, firebaseConfigLoading, appCheckLoading, basePath, collections, views, authController, userConfigPersistence, dateTimeFormat, firestoreDelegate, storageSource, locale, baseCollectionPath, onAnalyticsEvent, plugins, propertyConfigs, authLoading, logoDark, logo, canAccessMainView, components, allowSkipLogin, signInOptions, notAllowedError, name, toolbarExtraWidget, autoOpenDrawer }: {
    firebaseApp: FirebaseApp,
    fireCMSBackend: FireCMSBackend,
    configError: string | undefined,
    firebaseConfigLoading: boolean,
    appCheckLoading: boolean,
    basePath: string | undefined,
    collections: EntityCollection[] | EntityCollectionsBuilder | undefined,
    views: CMSView[] | CMSViewsBuilder | undefined,
    authController: FirebaseAuthController,
    userConfigPersistence: UserConfigurationPersistence,
    dateTimeFormat: string | undefined,
    firestoreDelegate: DataSourceDelegate,
    storageSource: StorageSource,
    locale?: Locale,
    baseCollectionPath: string | undefined,
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void,
    plugins: FireCMSPlugin[] | undefined,
    propertyConfigs: Record<string, PropertyConfig<any>>,
    authLoading: boolean,
    logoDark: string | undefined,
    logo: string | undefined,
    canAccessMainView: boolean,
    components?: ComponentsRegistry,
    allowSkipLogin: boolean | undefined,
    signInOptions: Array<FirebaseSignInProvider | FirebaseSignInOption> | undefined,
    notAllowedError: any, name: string,
    toolbarExtraWidget: React.ReactNode | undefined,
    autoOpenDrawer: boolean | undefined
}) {

    if (!firebaseApp.options.projectId) {
        throw new Error("No firebase project id")
    }
    const projectConfig = useBuildProjectConfig({
        projectId: firebaseApp.options.projectId,
        backendFirebaseApp: fireCMSBackend.backendFirebaseApp,
    });

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();

    if (configError) {
        return <CenteredView fullScreen={true}>{configError}</CenteredView>;
    }

    return (
        <BrowserRouter basename={basePath}>
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>

                    <FireCMSBackEndProvider {...fireCMSBackend}>
                        <ProjectConfigProvider config={projectConfig}>
                            <FireCMS
                                collections={collections}
                                views={views}
                                authController={authController}
                                userConfigPersistence={userConfigPersistence}
                                dateTimeFormat={dateTimeFormat}
                                dataSourceDelegate={firestoreDelegate}
                                storageSource={storageSource}
                                entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                                locale={locale}
                                basePath={basePath}
                                baseCollectionPath={baseCollectionPath}
                                onAnalyticsEvent={onAnalyticsEvent}
                                plugins={plugins}
                                propertyConfigs={propertyConfigs}>
                                {({
                                      context,
                                      loading
                                  }) => {

                                    let component;
                                    if (loading || authLoading) {
                                        component = <CircularProgressCenter size={"large"}/>;
                                    } else {
                                        const usedLogo = modeController.mode === "dark" && logoDark ? logoDark : logo;
                                        if (!canAccessMainView) {
                                            const LoginViewUsed = components?.LoginView ?? FirebaseLoginView;
                                            component = (
                                                <LoginViewUsed
                                                    logo={usedLogo}
                                                    allowSkipLogin={allowSkipLogin}
                                                    signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                                    firebaseApp={firebaseApp}
                                                    authController={authController}
                                                    notAllowedError={notAllowedError}/>
                                            );
                                        } else {
                                            component = (
                                                <Scaffold
                                                    name={name}
                                                    logo={usedLogo}
                                                    fireCMSAppBarComponentProps={{
                                                        endAdornment: toolbarExtraWidget
                                                    }}
                                                    autoOpenDrawer={autoOpenDrawer}>
                                                    <NavigationRoutes
                                                        HomePage={components?.HomePage}/>
                                                    <SideDialogs/>
                                                </Scaffold>
                                            );
                                        }
                                    }

                                    return component;
                                }}
                            </FireCMS>
                        </ProjectConfigProvider>
                    </FireCMSBackEndProvider>
                </ModeControllerProvider>
            </SnackbarProvider>
        </BrowserRouter>
    );
}
