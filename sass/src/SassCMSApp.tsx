import React, { useCallback } from "react";

import { GoogleAuthProvider } from "firebase/auth";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";

import "@fontsource/ibm-plex-mono";
import "typeface-rubik";

import {
    AuthController,
    Authenticator,
    CircularProgressCenter,
    CMSView,
    createCMSDefaultTheme,
    EntityCollection,
    FirebaseAuthDelegate,
    FirebaseLoginView,
    FireCMS,
    NavigationRoutes,
    resolvePermissions,
    Scaffold,
    SideDialogs,
    useBuildFirebaseAuthDelegate,
    useFirebaseStorageSource,
    useFirestoreDataSource,
    useInitialiseFirebase
} from "@camberi/firecms";

import { firebaseConfig } from "./firebase_config";
import { CollectionEditorsProvider } from "./CollectionEditorProvider";
import { ConfigPermissions } from "./config_permissions";
import { SassDrawer } from "./components/SassDrawer";
import {
    useBuildFirestoreConfigController
} from "./useBuildFirestoreConfigController";
import { ConfigControllerProvider } from "./ConfigControllerProvider";
import { productsCollection } from "./products_collection";
import {
    SassEntityCollectionView
} from "./components/SassEntityCollectionView";
import { SassHomePage } from "./components/SassHomePage";
import { UsersView } from "./components/users/UsersView";
import { getUserRoles } from "./util/permissions";
import { RolesView } from "./components/roles/RolesView";

const DEFAULT_SIGN_IN_OPTIONS = [
    GoogleAuthProvider.PROVIDER_ID
];



/**
 * This is an example of how to use the components provided by FireCMS for
 * a better customisation.
 * @constructor
 */
export function SassCMSApp() {

    const signInOptions = DEFAULT_SIGN_IN_OPTIONS;

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    } = useInitialiseFirebase({ firebaseConfig });

    const authDelegate: FirebaseAuthDelegate = useBuildFirebaseAuthDelegate({
        firebaseApp,
        signInOptions
    });

    const dataSource = useFirestoreDataSource({
        firebaseApp
    });

    const storageSource = useFirebaseStorageSource({ firebaseApp: firebaseApp });

    const configController = useBuildFirestoreConfigController({
        firebaseApp,
        // configPath,
        collections: [productsCollection]
    });

    const sassAuthenticator: Authenticator = useCallback(({ user, authController }) => {
        if (!user) return false;
        const sassUser = configController.users.find((sassUser) => sassUser.email === user?.email)
        if (!sassUser) throw Error("No user was found with email " + user.email);
        console.log("Allowing access to", user?.email);
        const userRoles = getUserRoles(configController.roles, sassUser);
        authController.setExtra({ roles: userRoles });
        return true;
    }, [configController]);

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
        return <CircularProgressCenter/>;
    }

    const configPermissions: ConfigPermissions = {
        createCollections: true,
        editCollections: true,
        deleteCollections: true
    }

    const views:CMSView[] = [
        {
            path: "users",
            name: "Users",
            group: "Admin",
            icon: "People",
            view: <UsersView/>
        },
        {
            path: "roles",
            name: "Roles",
            group: "Admin",
            icon: "GppGood",
            view: <RolesView collections={configController.collections}/>
        }
    ]
    return (
        <Router>
            {!configController.loading && <FireCMS authDelegate={authDelegate}
                                                   collections={configController.collections}
                                                   authentication={sassAuthenticator}
                                                   dataSource={dataSource}
                                                   views={views}
                                                   storageSource={storageSource}
                                                   EntityCollectionViewComponent={SassEntityCollectionView}
                                                   entityLinkBuilder={({ entity }) => `https://console.firebase.google.com/project/${firebaseApp.options.projectId}/firestore/data/${entity.path}/${entity.id}`}>
                {({ context, mode, loading }) => {

                    const authController = context.authController;
                    const theme = createCMSDefaultTheme({ mode });

                    let component;
                    if (loading || configController.loading) {
                        component = <CircularProgressCenter/>;
                    } else {
                        if (!authController.canAccessMainView) {
                            component = (
                                <FirebaseLoginView
                                    allowSkipLogin={false}
                                    signInOptions={signInOptions}
                                    firebaseApp={firebaseApp}
                                    authDelegate={authDelegate}/>
                            );
                        } else {
                            component = (
                                <Scaffold name={"My Online Shop"}
                                          Drawer={SassDrawer}>
                                    <NavigationRoutes
                                        HomePage={SassHomePage}
                                    />
                                    <SideDialogs/>
                                </Scaffold>
                            );
                        }
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            <ConfigControllerProvider
                                configController={configController}>
                                <CollectionEditorsProvider
                                    saveCollection={configController.saveCollection}
                                    configPermissions={configPermissions}>
                                    <CssBaseline/>
                                    {component}
                                </CollectionEditorsProvider>
                            </ConfigControllerProvider>
                        </ThemeProvider>
                    );
                }}
            </FireCMS>}
        </Router>
    );

}

function filterAllowedCollections<M>(collections: EntityCollection<M>[],
                                     authController: AuthController,
                                     paths: string[] = []): EntityCollection<M>[] {
    return collections
        .map((collection) => {
            const permissions = resolvePermissions(collection, authController, [...paths, collection.alias ?? collection.path]);
            return ({
                ...collection,
                subcollections: collection.subcollections
                    ? filterAllowedCollections(collection.subcollections, authController, [...paths, collection.alias ?? collection.path])
                    : undefined,
                permissions
            });
        })
        .filter(collection => {
            return collection.permissions.read === undefined || collection.permissions.read;
        });
}
