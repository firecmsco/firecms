import { useCallback } from "react";

import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import { User as FirebaseUser } from "firebase/auth";
import { Authenticator, FireCMSProApp } from "@firecms/firebase_pro";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { firebaseConfig } from "./firebase-config";
import { productsCollection } from "./collections/products";

export default function App() {

    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        console.log("Allowing access to", user?.email);

        return true;
    }, []);

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        // Paths that will be enhanced
        getConfigForPath: ({ path }) => {
            return true;
        }
    });

    return <FireCMSProApp
        name={"My Online Shop"}
        plugins={[dataEnhancementPlugin]}
        authentication={myAuthenticator}
        collections={[productsCollection]}
        firebaseConfig={firebaseConfig}
    />;
}
