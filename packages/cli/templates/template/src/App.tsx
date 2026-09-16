import React, { useCallback, useMemo } from "react";

import {
    AppBar,
    Authenticator,
    CircularProgressCenter,
    Drawer,
    FireCMS,
    FireCMSi18nProvider,
    ModeControllerProvider,
    NavigationRoutes,
    Scaffold,
    SideDialogs,
    SnackbarProvider,
    useBuildLocalConfigurationPersistence,
    useBuildModeController,
    useBuildNavigationController,
    useValidateAuthenticator
} from "@firecms/core";
import {
    FirebaseAuthController,
    FirebaseLoginView,
    FirebaseSignInProvider,
    FirebaseUserWrapper,
    useFirebaseAuthController,
    useFirebaseStorageSource,
    useFirestoreDelegate,
    useInitialiseFirebase,
} from "@firecms/firebase";
import { CenteredView } from "@firecms/ui";
import { demoCollection } from "./collections/demo";
import { productsCollection } from "./collections/products";

import { firebaseConfig } from "./firebase_config";

/**
 * Whether firebase_config.ts holds a real project's config, or still the placeholders the
 * template ships. `firecms init` fills them in when you are logged in.
 */
function isFirebaseConfigured(config: Record<string, string>): boolean {
    return Boolean(config.projectId) && Object.values(config).every(value =>
        typeof value === "string"
        && value.length > 0
        && !value.startsWith("YOUR_")
        && !value.includes("["));
}

/**
 * Shown instead of a blank page when firebase_config.ts is still the placeholder the
 * template ships: the app used to throw while rendering, so the browser showed nothing at
 * all and the reason was only in the console.
 */
function MissingFirebaseConfig({ file }: { file: string }) {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-8 text-center">
        <h1 className="text-2xl font-bold">Firebase config missing</h1>
        <p>Add your Firebase web app config to <code className="font-mono">{file}</code>.</p>
        <p>You can find it in the Firebase console, under Project settings, or run{" "}
            <code className="font-mono">npx @firecms/cli login</code> and scaffold again to have it filled in.</p>
    </div>;
}

function App() {

    if (!isFirebaseConfigured(firebaseConfig)) {
        return <MissingFirebaseConfig file={"src/firebase_config.ts"}/>;
    }

    // Use your own authentication logic here
    const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                       user,
                                                                                       authController
                                                                                   }) => {

        if (user?.email?.includes("flanders")) {
            // You can throw an error to prevent access
            throw Error("Stupid Flanders!");
        }

        const idTokenResult = await user?.firebaseUser?.getIdTokenResult();
        const userIsAdmin = idTokenResult?.claims.admin || user?.email?.endsWith("@firecms.co");

        console.log("Allowing access to", user);

        // we allow access to every user in this case
        return true;
    }, []);

    const collections = useMemo(() => [
        demoCollection,
        // Mounted because demoCollection references it: a reference to a collection that is
        // not mounted shows an error in every row and in the form.
        productsCollection
    ], []);

    const {
        firebaseApp,
        firebaseConfigLoading,
        configError
    } = useInitialiseFirebase({
        firebaseConfig
    });

    // Controller used to manage the dark or light color mode
    const modeController = useBuildModeController();

    const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

    // Controller for managing authentication
    const authController: FirebaseAuthController = useFirebaseAuthController({
        firebaseApp,
        signInOptions
    });

    // Controller for saving some user preferences locally.
    const userConfigPersistence = useBuildLocalConfigurationPersistence();

    // Delegate used for fetching and saving data in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Controller used for saving and fetching files in storage
    const storageSource = useFirebaseStorageSource({
        firebaseApp
    });

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        authController,
        authenticator: myAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const navigationController = useBuildNavigationController({
        disabled: authLoading,
        collections,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) {
        return <>
            <CircularProgressCenter/>
        </>;
    }

    if (configError) {
        return <CenteredView>{configError}</CenteredView>;
    }

    return (
        <FireCMSi18nProvider>
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>
                <FireCMS
                    navigationController={navigationController}
                    authController={authController}
                    userConfigPersistence={userConfigPersistence}
                    dataSourceDelegate={firestoreDelegate}
                    storageSource={storageSource}
                >
                    {({
                          context,
                          loading
                      }) => {

                        if (loading || authLoading) {
                            return <CircularProgressCenter size={"large"}/>;
                        }

                        if (!canAccessMainView) {
                            return <FirebaseLoginView authController={authController}
                                                      firebaseApp={firebaseApp}
                                                      signInOptions={signInOptions}
                                                      notAllowedError={notAllowedError}/>;
                        }

                        return <Scaffold
                            autoOpenDrawer={false}>
                            <AppBar title={"My demo app"}/>
                            <Drawer/>
                            <NavigationRoutes/>
                            <SideDialogs/>
                        </Scaffold>;
                    }}
                </FireCMS>
                </ModeControllerProvider>
            </SnackbarProvider>
        </FireCMSi18nProvider>
    );

}

export default App;
