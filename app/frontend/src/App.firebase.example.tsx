/**
 * Example: Rebase app wired to Firebase as the backend.
 * 
 * This demonstrates the backend-agnostic architecture —
 * the same <Rebase>, <RebaseCMS>, <RebaseShell> component tree
 * works with both the Rebase custom backend and Firebase.
 * 
 * To use: rename this file to App.tsx and configure your Firebase project.
 */
import React from "react";
import { initializeApp } from "@firebase/app";
import { Rebase } from "@rebasepro/core";
import { RebaseAuth } from "@rebasepro/auth-rebase";
import { RebaseCMS, RebaseShell } from "@rebasepro/cms";
import {
    useFirebaseAuthController,
    useFirestoreDriver,
    useFirebaseStorageSource
} from "@rebasepro/firebase";
import { collections } from "virtual:rebase-collections";

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);

export function App() {
    // Firebase-specific hooks — they implement the same generic interfaces
    const authController = useFirebaseAuthController({
        firebaseApp,
        signInOptions: ["google.com"]
    });

    const driver = useFirestoreDriver({ firebaseApp });
    const storageSource = useFirebaseStorageSource({ firebaseApp });

    // Everything below is identical to the Postgres-backed app.
    // <Rebase> accepts the same AuthController, DataDriver, and StorageSource
    // interfaces regardless of which backend provides them.
    return (
        <Rebase
            authController={authController}
            driver={driver}
            storageSource={storageSource}
        >
            <RebaseAuth />
            <RebaseCMS collections={collections} />
            <RebaseShell title="My Firebase App" />
        </Rebase>
    );
}
