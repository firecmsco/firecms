import React, { useCallback, useEffect } from "react";

import { FirebaseApp, initializeApp } from "firebase/app";

/**
 * @category Firebase
 */
export interface InitialiseFirebaseResult {
    firebaseConfigLoading: boolean,
    firebaseApp?: FirebaseApp;
    configError?: string,
    firebaseConfigError?: Error
}

const hostingError = "It seems like the provided Firebase config is not correct. If you \n" +
    "are using the credentials provided automatically by Firebase \n" +
    "Hosting, make sure you link your Firebase app to Firebase Hosting. \n";

/**
 * Function used to initialise Firebase, either by using the provided config,
 * or by fetching it by Firebase Hosting, if not specified.
 *
 * It works as a hook that gives you the loading state and the used
 * configuration.
 *
 * You most likely only need to use this if you are developing a custom app
 * that is not using {@link FirebaseCMSApp}. You can also not use this component
 * and initialise Firebase yourself.
 *
 * @param onFirebaseInit
 * @param firebaseConfig
 * @param name
 * @category Firebase
 */
export function useInitialiseFirebase({
                                          firebaseConfig,
                                          onFirebaseInit,
                                          name,
                                          authDomain
                                      }: {
    onFirebaseInit?: ((config: object) => void) | undefined,
    firebaseConfig: Record<string, unknown> | undefined,
    name?: string;
    authDomain?: string;
}): InitialiseFirebaseResult {

    const [firebaseApp, setFirebaseApp] = React.useState<FirebaseApp | undefined>();
    const [firebaseConfigLoading, setFirebaseConfigLoading] = React.useState<boolean>(false);
    const [configError, setConfigError] = React.useState<string>();

    const initFirebase = useCallback((config: Record<string, unknown>) => {
        try {
            const initialisedFirebaseApp = initializeApp(config, name ?? "[DEFAULT]");
            setConfigError(undefined);
            setFirebaseConfigLoading(false);
            if (onFirebaseInit)
                onFirebaseInit(config);
            setFirebaseApp(initialisedFirebaseApp);
        } catch (e: any) {
            console.error("Error initialising Firebase", e);
            setConfigError(hostingError + "\n" + (e.message ?? JSON.stringify(e)));
        }
    }, [name]);

    useEffect(() => {

        setFirebaseConfigLoading(true);

        if (firebaseConfig) {
            initFirebase(firebaseConfig);
        } else if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    console.debug("Firebase init response", response.status);
                    if (response && response.status < 300) {
                        const config = await response.json();
                        if (authDomain) config.authDomain = authDomain;
                        initFirebase(config);
                    }
                })
                .catch(e => {
                        setFirebaseConfigLoading(false);
                        setConfigError(
                            "Could not load Firebase configuration from Firebase hosting. " +
                            "If the app is not deployed in Firebase hosting, you need to specify the configuration manually" +
                            e.toString()
                        );
                    }
                );
        } else {
            setFirebaseConfigLoading(false);
            setConfigError(
                "You need to deploy the app to Firebase hosting or specify a Firebase configuration object"
            );
        }
    }, [firebaseConfig, initFirebase]);

    return {
        firebaseApp,
        firebaseConfigLoading,
        configError
    };
}
