import { useCallback } from "react";

import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

import { User as FirebaseUser } from "firebase/auth";
import { Authenticator, FirebaseCMSApp } from "firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { firebaseConfig } from "./firebase-config.ts";
import { productsCollection } from "./collections/products.tsx";

export default function App() {


    const myAuthenticator: Authenticator<FirebaseUser> = useCallback(async ({
                                                                                user,
                                                                                authController
                                                                            }) => {

        if (user?.email?.includes("flanders")) {
            throw Error("Stupid Flanders!");
        }

        console.log("Allowing access to", user?.email);
        // This is an example of retrieving async data related to the user
        // and storing it in the controller's extra field.
        const sampleUserRoles = await Promise.resolve(["admin"]);
        authController.setExtra(sampleUserRoles);

        return true;
    }, []);


    const dataEnhancementPlugin = useDataEnhancementPlugin({
        // Paths that will be enhanced
        getConfigForPath: ({ path }) => {
            return true;
        }
    });

    return <FirebaseCMSApp
        name={"My Online Shop"}
        plugins={[dataEnhancementPlugin]}
        authentication={myAuthenticator}
        collections={[productsCollection]}
        firebaseConfig={firebaseConfig}
    />;
}
