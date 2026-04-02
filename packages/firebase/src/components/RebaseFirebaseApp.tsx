import React from "react";
import { GoogleAuthProvider } from "@firebase/auth";

import {
    AppBar,
    CircularProgressCenter,
    Drawer,
    Rebase,
    RebaseRoute,
    ModeControllerProvider,
    PropertyConfig,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBrowserTitleAndIcon,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildAdminModeController,
    AdminModeControllerProvider,
    useBuildCollectionRegistryController,
    useBuildCMSUrlController,
    useBuildNavigationStateController,
    useValidateAuthenticator
} from "@rebasepro/core";
import { buildRebaseData } from "@rebasepro/common";
import { Route, Routes, Outlet } from "react-router-dom";

import { RebaseFirebaseAppProps } from "./RebaseFirebaseAppProps";
import { FirebaseLoginView } from "./FirebaseLoginView";
import {
    useAppCheck,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDriver,
    useInitialiseFirebase,
} from "../hooks";
import { CenteredView } from "@rebasepro/ui";
import { FirebaseAuthController } from "../types";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];

/**
 * This is the default implementation of a Rebase app using the Firebase services
 * as a backend.
 * You can use this component as a full app, by specifying collections and
 * entity collections.
 *
 * This component is in charge of initialising Firebase, with the given
 * configuration object.
 *
 * If you are building a larger app and need finer control, you can use
 * {@link Rebase}, {@link Scaffold}, {@link SideDialogs}
 * and {@link NavigationRoutes} instead.
 *
 * @param props

 * @category Firebase
 */
export function RebaseFirebaseApp({
    name,
    logo,
    logoDark,
    authenticator,
    collections,
    views,
    adminViews,
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
    userManagement
}: RebaseFirebaseAppProps) {

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

    /**
     * Controller used to manage the dark or light color mode
     */
    const modeController = useBuildModeController();
    const adminModeController = useBuildAdminModeController();

    const {
        loading,
        appCheckVerified,
        error
    } = useAppCheck({
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

    const firestoreDelegate = useFirestoreDriver({
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
        authenticator,
        data: buildRebaseData(firestoreDelegate),
        storageSource
    });

    const collectionRegistryController = useBuildCollectionRegistryController({
        userConfigPersistence
    });

    const cmsUrlController = useBuildCMSUrlController({
        basePath: basePath ?? "/",
        baseCollectionPath: baseCollectionPath ?? "/c",
        collectionRegistryController
    });

    const navigationStateController = useBuildNavigationStateController({
        collections,
        views,
        adminViews,
        authController,
        data: buildRebaseData(firestoreDelegate),
        plugins,
        collectionRegistryController,
        cmsUrlController,
        adminMode: adminModeController.mode,
        userManagement
    });

    if (firebaseConfigLoading || !firebaseApp || loading) {
        return <>
            <CircularProgressCenter />
        </>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    return (
        <SnackbarProvider>
            <ModeControllerProvider value={modeController}>
                <AdminModeControllerProvider value={adminModeController}>

                    <Rebase
                        authController={authController}
                        collectionRegistryController={collectionRegistryController}
                        cmsUrlController={cmsUrlController}
                        navigationStateController={navigationStateController}
                        userConfigPersistence={userConfigPersistence}
                        dateTimeFormat={dateTimeFormat}
                        driver={firestoreDelegate}
                        storageSource={storageSource}
                        userManagement={userManagement}
                        entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                        locale={locale}
                        onAnalyticsEvent={onAnalyticsEvent}
                        plugins={plugins}
                        propertyConfigs={propertyConfigs}>
                        {({
                            context,
                            loading
                        }) => {

                            let component;
                            if (loading || authLoading) {
                                component = <CircularProgressCenter size={"large"} />;
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
                                            notAllowedError={notAllowedError} />
                                    );
                                } else {
                                    component = (
                                        <Routes>
                                            <Route element={
                                                <Scaffold
                                                    logo={usedLogo}
                                                    autoOpenDrawer={autoOpenDrawer}>
                                                    <AppBar title={name} logo={usedLogo} />
                                                    <Drawer />
                                                    <Outlet />
                                                    <SideDialogs />
                                                </Scaffold>
                                            }>
                                                {components?.HomePage && <Route path="/" element={<components.HomePage />} />}
                                                <Route path="/c/*" element={<RebaseRoute />} />
                                            </Route>
                                        </Routes>
                                    );
                                }
                            }

                            return component;
                        }}
                    </Rebase>
                </AdminModeControllerProvider>
            </ModeControllerProvider>
        </SnackbarProvider>
    );
}
