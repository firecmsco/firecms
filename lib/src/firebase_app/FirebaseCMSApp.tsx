import React from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import {
    CircularProgressCenter,
    createCMSDefaultTheme,
    FireCMS,
    Scaffold,
    SideDialogs,
} from "../core";

import { FirebaseCMSAppProps } from "./FirebaseCMSAppProps";
import { useFirebaseAuthDelegate } from "./hooks/useFirebaseAuthDelegate";
import { useFirestoreDataSource } from "./hooks/useFirestoreDataSource";
import { useFirebaseStorageSource } from "./hooks/useFirebaseStorageSource";
import { useInitialiseFirebase } from "./hooks/useInitialiseFirebase";
import { FirebaseLoginView } from "./components/FirebaseLoginView";
import { FirebaseAuthDelegate } from "./models/auth";
import {
    useBuildLocalConfigurationPersistence
} from "../core/internal/useBuildLocalConfigurationPersistence";
import { CollectionRoute } from "../core/routes/CollectionRoute";
import { CMSRoute } from "../core/routes/CMSViewRoute";
import { HomeRoute } from "../core/routes/HomeRoute";
import { NotFoundPage } from "../core/components/NotFoundPage";

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
export function FirebaseCMSApp({
                                   name,
                                   logo,
                                   toolbarExtraWidget,
                                   authentication,
                                   collectionOverrideHandler,
                                   collections,
                                   views,
                                   textSearchController,
                                   allowSkipLogin,
                                   signInOptions = DEFAULT_SIGN_IN_OPTIONS,
                                   firebaseConfig,
                                   onFirebaseInit,
                                   primaryColor,
                                   secondaryColor,
                                   fontFamily,
                                   dateTimeFormat,
                                   locale,
                                   HomePage,
                                   basePath,
                                   baseCollectionPath,
                                   LoginViewProps
                               }: FirebaseCMSAppProps) {

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({
        onFirebaseInit,
        firebaseConfig
    });

    /**
     * Controller for managing authentication
     */
    const authDelegate: FirebaseAuthDelegate = useFirebaseAuthDelegate({
        firebaseApp,
        signInOptions
    });

    /**
     * Controller for saving some user preferences locally.
     */
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    /**
     * Controller in charge of fetching and persisting data
     */
    const dataSource = useFirestoreDataSource({
        firebaseApp,
        textSearchController
    });

    /**
     * Controller used for saving and fetching files in storage
     */
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    if (configError) {
        return <div> {configError} </div>;
    }

    if (firebaseConfigError) {
        return <div>
            It seems like the provided Firebase config is not correct. If you
            are using the credentials provided automatically by Firebase
            Hosting, make sure you link your Firebase app to Firebase
            Hosting.
        </div>;
    }

    if (firebaseConfigLoading || !firebaseApp) {
        return <>
            <CssBaseline/>
            <CircularProgressCenter/>
        </>;
    }

    return (
        <BrowserRouter basename={basePath}>
            <FireCMS
                collections={collections}
                views={views}
                authDelegate={authDelegate}
                authentication={authentication}
                userConfigPersistence={userConfigPersistence}
                collectionOverrideHandler={collectionOverrideHandler}
                dateTimeFormat={dateTimeFormat}
                dataSource={dataSource}
                storageSource={storageSource}
                entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}
                locale={locale}
                basePath={basePath}
                baseCollectionPath={baseCollectionPath}>
                {({ context, mode, loading }) => {

                    const { navigation } = context;
                    const theme = createCMSDefaultTheme({
                        mode,
                        primaryColor,
                        secondaryColor,
                        fontFamily
                    });

                    let component;
                    if (loading) {
                        component = <CircularProgressCenter/>;
                    } else if (!context.authController.canAccessMainView) {
                        component = (
                            <FirebaseLoginView
                                logo={logo}
                                allowSkipLogin={allowSkipLogin}
                                signInOptions={signInOptions ?? DEFAULT_SIGN_IN_OPTIONS}
                                firebaseApp={firebaseApp}
                                authDelegate={authDelegate}
                                {...LoginViewProps}
                                />
                        );
                    } else {
                        component = (
                            <Scaffold
                                name={name}
                                logo={logo}
                                toolbarExtraWidget={toolbarExtraWidget}>

                                <Routes location={navigation.baseLocation}>

                                    {navigation.collections.map((collection) =>
                                        <CollectionRoute
                                            key={`navigation_${collection.alias ?? collection.path}`}
                                            collection={collection}/>
                                    )}

                                    {navigation.views.map(cmsView =>
                                        <CMSRoute
                                            key={`navigation_${cmsView.path}`}
                                            cmsView={cmsView}/>)}

                                    <HomeRoute HomePage={HomePage}/>

                                    <Route path={"*"}
                                           element={<NotFoundPage/>}/>

                                </Routes>

                                <SideDialogs/>

                            </Scaffold>
                        );
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            <CssBaseline/>
                            {component}
                        </ThemeProvider>
                    );
                }}
            </FireCMS>
        </BrowserRouter>
    );
}
