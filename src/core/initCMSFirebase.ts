import React, { useEffect } from "react";

import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

export interface CMSFirebaseInitResult {
    firebaseConfigLoading: boolean,
    usedFirebaseConfig? : object,
    configError?: string,
    firebaseConfigError?: Error
}

/**
 * Function used to initialise Firebase, either by using the provided config,
 * or by fetching it by Firebase Hosting, if not specified.
 *
 * It works as a hook that gives you the loading state and the used
 * configuration.
 *
 * You most likely only need to use this if you are developing a custom app
 * that is not using {@link CMSApp}. You can also not use this component
 * and initialise Firebase yourself.
 *
 * @param onFirebaseInit
 * @param firebaseConfig
 */
export function initCMSFirebase(onFirebaseInit: ((config: object) => void) | undefined, firebaseConfig: Object | undefined):CMSFirebaseInitResult {

    const [usedFirebaseConfig, setUsedFirebaseConfig] = React.useState<Object>();
    const [firebaseConfigLoading, setFirebaseConfigLoading] = React.useState<boolean>(false);
    const [configError, setConfigError] = React.useState<string>();
    const [firebaseConfigError, setFirebaseConfigError] = React.useState<Error | undefined>();

    function initFirebase(config: Object) {
        if (firebase.apps.length === 0) {
            try {
                firebase.initializeApp(config);
                firebase.analytics();
                setUsedFirebaseConfig(config);
                setFirebaseConfigError(undefined);
                setFirebaseConfigLoading(false);
                if (onFirebaseInit)
                    onFirebaseInit(config);
            } catch (e) {
                console.error(e);
                setFirebaseConfigError(e);
            }
        }
    }

    useEffect(() => {

        if (firebase.apps.length > 0)
            return;

        setFirebaseConfigLoading(true);

        if (firebaseConfig) {
            console.log("Using specified config", firebaseConfig);
            initFirebase(firebaseConfig);
        } else if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    console.debug("Firebase init response", response.status);
                    if (response && response.status < 300) {
                        const config = await response.json();
                        console.log("Using configuration fetched from Firebase Hosting", config);
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
    }, []);

    return {
        firebaseConfigLoading,
        usedFirebaseConfig,
        configError,
        firebaseConfigError
    };
}
